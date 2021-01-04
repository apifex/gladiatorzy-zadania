// Stwórz logikę w node wykorzystując metodę GET opartą o restowy endpoint
// która pozwoli na rozwiązanie takiego problemu:

// 1. Chcesz do użytkownika wysłać maila nr 1 z linkiem do kliknięcia

// przykładowa treść maila nr 1:
// hej wygrałeś spadek do ciotce z teksasu
// kliknij w przycisk aby odebrać wygraną



// 2. Wtedy kiedy użytkownik kliknie w link w mailu nr 1, to chcesz aby otrzymał maila nr 2

// przykładowa treść maila nr 2:
// it's a prank bro!

import express from 'express';
import nodemailer from 'nodemailer';
import { Request } from 'express';


const PORT = 5000
const MYADDRESS = 'https://adressofmyserver'
const GETPOINT = "takeheritage"

const tokenBase = new Map<string, string>()

const server = express();
interface IMail {
    from: string,
    to: string,
    subject: string,
    html: string,
}

server.get(`/${GETPOINT}`, async (req: Request): Promise<void> => {
        try {
            if (typeof(req.query.id) === 'string' && typeof(req.query.token) === 'string') {
                if (req.query.token === tokenBase.get(req.query.id)) {
                    console.log({
                        from: 'Uncle from USA<uncle@example.com>',
                        to: req.query.id,
                        subject: "Hello agin",
                        html: `<b>To był tylko żart ;) Tak więc, wracaj do roboty a nie licz na spadek!</b>`, // html body
                    })
                }
            }
        } catch (error) {
            console.log("Somethink went wrong when getting request!", error)
        }
    }
) 

const doPrank = (mailadress: string): void => {
    let token = createToken(mailadress)
    let id = mailadress
    tokenBase.set(id, token)
    let link = `${MYADDRESS}/${GETPOINT}?id=${id}&token=${token}`
    sendMail({
        from: 'Uncle from USA<uncle@example.com>',
        to: mailadress,
        subject: "Hello ✔",
        html: `<b>Witaj</b><p>Spadek po wujku Mietku z USA czeka na ciebie!</p><a href=${link}>Kliknij tutaj aby go odebrać</a>`,
      } 
    )
}

const createToken = (mailadress : string): string => {
    return Math.floor(mailadress.length*Math.random()*100000).toString();
}

// nodemailer => 
const transporter = nodemailer.createTransport({
    host: "smtp...",
    port: 465,
    secure: true, 
    auth: {
        user: 'username',
        pass: 'password'
    },
});

const sendMail = async (mail: IMail): Promise<void> => {
    try{
        await transporter.sendMail(mail)
    } catch (error) {
        console.log("Error when sending mail:", error)
    }
}


server.listen(PORT, () => console.log(`App is listening on port ${PORT}`))

doPrank("somemail@mail.com")