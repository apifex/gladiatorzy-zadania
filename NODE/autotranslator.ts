// to są dane językowe Twojej apki
// załóżmy, że zaciągasz te dane z bazy

// const pl = {
//   attention:{
//       title:'Dobrze, że jesteś, sprawdź to zadanie',
//       subtitle:'Pomoże Ci ogarnąć jak zmieniać język w apkach reacta',
//       ctaButton:'Dowiedź się więcej',
//   },
//   newsletter:{
//       title:'Bądź na bieżąco',
//       ctaButton:'Idź do repo ->',
//       action:'/new-subscriber?lang=pl'
//   }
// }

// do endpointa leci sobie takie requestBody
// const requestBody = {
//   lang:'en'
// }


// stwórz logikę, która w tym endpoint obrazowanym funkcją translate wykona:
// - pobranie wszystkich danych językowych
// - przetłumaczenie ich poprzez API google translate na język podany w requestBody 
// -- link do dokumentacji - https://cloud.google.com/translate/docs/reference/rest/v2/translate
// - zapis wszystkich danych we wskazanym języku w formie pliku js o nazwie tego języka (dla angielskiego będzie to en.json)
// - w response zwróci kompletny obiekt z tekstami

// cache:
// - jeśli przy zapytaniu o tłumaczenie na język angielski istnieje już plik en.json to jego zawartość jest zwracana w response


import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
const {Translate} = require('@google-cloud/translate').v2

let sourcelang = 'pl'

const pl = {
  attention:{
      title:'Dobrze, że jesteś, sprawdź to zadanie',
      subtitle:'Pomoże Ci ogarnąć jak zmieniać język w apkach reacta',
      ctaButton:'Dowiedź się więcej',
  },
  newsletter:{
      title:'Bądź na bieżąco',
      ctaButton:'Idź do repo ->',
      action:'/new-subscriber?lang=pl'
  }
}

const PORT = 5000
const PROJECT_ID = '##nameOfProject##'
const API_KEY = '##keyfromgoogleapis##'
const SOURCE_LANG = 'pl'

const server = express();

const translate = async (request: Request, response: Response) => {
  try{
    let langName: string = request.body.lang
    if (fs.existsSync(`./${langName}.json`)) {
      response.send(`./${langName}.json`)
    } else {
    const langData = pl //jakis system pobierania danych(node-fetch, polaczenie z baza danych etc)
                        // jesli pobiera .json to w tym miejscu JSON.parse(...)    
    const toTranslate = getDataFromObject(langData)
    const translateApi = new Translate({key: API_KEY, projectId: PROJECT_ID})
    const translated = await translateApi.translate(toTranslate, langName);
    const resp = createNewLang(translated[0], langData, langName)
    fs.writeFile(`./${langName}.json`, JSON.stringify(resp), ()=>{})
    return response.send(resp)}
  } catch (err) {
    console.log(err)
  }    
}

const getDataFromObject = (langData: Object): String[] => {
  const toTranslate: String[] = []
  Object.values(langData).forEach(el=> {
    if (typeof el === "string") {
      toTranslate.push(el)
    } else if (typeof el === "object") {
      Object.values(el).forEach(el=>{
        if (typeof el === "string") {
          toTranslate.push(el)
        } 
      })
    }
  })
return toTranslate
}       

const createNewLang = (translated: string[], langData: Object, langName: any) => {
  let langString = langName.toString();
  (langName as object) =  Object.assign({}, langData)
      Object.entries(langName).forEach(el=> {
      if (typeof el[1] === "string") {
        langName[el[0]] = translated.shift()
      } else if (typeof el[1] === "object") {
        // @ts-ignore
        Object.entries(el[1]).forEach(elem=>{
          if (typeof elem[1] === "string") {
            if (elem[1].includes(`lang=${SOURCE_LANG}`)) {
              langName[el[0]][elem[0]] = langName[el[0]][elem[0]].replace(`lang=${SOURCE_LANG}`, `lang=${langString}`)
            } else {
              langName[el[0]][elem[0]] = translated.shift()
            }
          } 
        })
      }
  })
  return langName;
}

const requestBody = {
  body: {lang:'cs'}
}
//@ts-ignore
translate(requestBody, ()=>{})

server.listen(PORT, () => console.log(`App is listening on port ${PORT}`))

