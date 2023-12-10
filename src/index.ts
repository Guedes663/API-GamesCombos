import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import connection from './connection';
import { v4 } from 'uuid';

dotenv.config()

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});

function gerarToken( infoDoUsuario: object ): any {
    return jwt.sign(
        infoDoUsuario,
        process.env.TOKEN_KEY,
        { expiresIn: "24h" }
    );
}

app.get('/usuario/login', async (req: Request, res: Response) => {
    try {
        const nomeUsuario = req.query.nomeUsuario;
        const email = req.query.email;
        const senha = req.query.senha;

        if( !nomeUsuario || !email || !senha) {
            throw new Error("'nome', 'email' e 'senha' são obrigatórios");
        }

        const dadosConsulta = await connection('usuario')
        .select('nomeUsuario', 'email', 'senha', 'role', 'idUsuario')
        .whereRaw('LOWER(nomeUsuario) LIKE LOWER(?) AND LOWER(email) LIKE LOWER(?) AND senha LIKE ?', [nomeUsuario, email, senha]);

        if(dadosConsulta.length === 0) {
            throw new Error('Usuário não cadastrado');
        }

        const role = dadosConsulta[0].role;
        const idUsuario = dadosConsulta[0].idUsuario;

        const token = gerarToken({ nomeUsuario, email, senha, role, idUsuario});

        res.status(200).send(token);
    }
    catch(error){
        if(error.message === "'nome', 'email' e 'senha' são obrigatórios" || error.message === 'Usuário não cadastrado') {
            res.status(400).send(error.message);
        }
        else {
            res.status(500).send(error.message);
        }
    }
});

app.get('/combos', async (req: Request, res: Response) => {
    try {
        let {filtro, ordem, pagina} = req.query;
        let resultadoPesquisa;

        if(!pagina) {
            pagina = '0';
        }

        if(!ordem) {
            ordem = 'asc';
        }

        if(ordem !== 'asc' && ordem !=='desc') {
            throw new Error("A ordem pode apenas receber valores 'asc' ou 'desc'");
        }

        if(!filtro) {
            resultadoPesquisa = await connection('combos').select('*')
            .orderBy('nomePersonagem', ordem as 'asc' | 'desc')
            .orderBy('jogo', ordem as 'asc' | 'desc')
            .limit(10).offset(parseInt(pagina as string, 10) * 10);
        }
        else{
            resultadoPesquisa = await connection('combos').select('*')
            .where('nomePersonagem', 'like', `%${filtro}%`)
            .orWhere('jogo', 'like', `%${filtro}%`)
            .orderBy('nomePersonagem', ordem as 'asc' | 'desc')
            .orderBy('jogo', ordem as 'asc' | 'desc')
            .limit(10).offset(parseInt(pagina as string, 10) * 10);
        }

        res.status(200).send(resultadoPesquisa);
    }
    catch (error) {
        if(error.message === "A ordem pode apenas receber valores 'asc' ou 'desc'" || error.message === 'A página precisa ser um número') {
            res.status(400).send(error.message);
        }
        else {
            res.status(500).send(error.message);
        }
    }
});

app.post('/usuario/registro', async (req: Request, res: Response) => {
    try {
        const { nomeUsuario, email, senha, role } = req.body;

        if( !nomeUsuario || !email || !senha || !role ) {
            throw new Error("'nome', 'email', 'senha' e role são obrigatórios");
        }

        if( role !== 'user' && role !== 'admin' ) {
            throw new Error('A role pode apenas ser preenchida com user ou admin');
        }

        const dadosConsulta = await connection('usuario')
        .select('nomeUsuario', 'email')
        .whereRaw('LOWER(nomeUsuario) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?)', [nomeUsuario, email]);

        if( dadosConsulta.length > 0 ) {
            if( dadosConsulta[0].nomeUsuario === nomeUsuario ) {
                throw new Error('nome de usuário já cadastrado');
            }

            if( dadosConsulta[0].email === email ) {
                throw new Error('Email já cadastrado');
            }
        }

        const idUsuario = v4();

        await connection('usuario').insert({
            idUsuario,
            nomeUsuario,
            email,
            senha,
            role
        });

        const token = gerarToken({idUsuario, nomeUsuario, email, senha, role});

        res.status(200).send(token);
    }
    catch(error) {
        if(error.message === "'nome', 'email', 'senha' e role são obrigatórios" || error.messsage === 'A role pode apenas ser preenchida com user ou admin' || error.message === 'nome de usuário já cadastrado' || error.message === 'Email já cadastrado') {
            res.status(400).send(error.message);
        }
        else {
            res.status(500).send(error.message);
        }
    }
});



app.post('/combos/adicionar', async (req: Request, res: Response) => {
    try {
        const {nomePersonagem, jogo, combo, videoCombo, token} = req.body;
        let usuarioId;

        if(!nomePersonagem || !jogo || !combo || !token) {
            throw new Error('O combo, token, nome do personagem e o nome do jogo são obrigatórios');
        }

        jwt.verify(token, process.env.TOKEN_KEY, (err: any, decoded: any) => {
            if(err) {
                throw new Error('Token inválido');
            } 
            else {
                usuarioId = decoded.idUsuario;
            }
        });

        if(videoCombo){
            await connection('combos').insert({nomePersonagem, jogo, combo, videoCombo, usuarioId});
        }
        else{
            await connection('combos').insert({nomePersonagem, jogo, combo, usuarioId});
        }

        res.status(200).send('Combo adicionado com sucesso!');
    }
    catch (error) {
        if( error.message === 'O combo, token, nome do personagem e o nome do jogo são obrigatórios' || error.message === 'Token inválido' ) {
            res.status(400).send(error.message);
        }
        else {
            res.status(500).send(error.message);
        }
    }
});

app.delete('/combos/deletar', async (req: Request, res: Response) => {
    try {
        const {token, idCombo} = req.body;
        let idUsuario, role;
        
        if(!token || !idCombo) {
            throw new Error('Token e idCombo é obrigatório');
        }

        jwt.verify(token, process.env.TOKEN_KEY, (err: any, decoded: any) => {
            if(err) {
                throw new Error('Token inválido');
            } 
            else {
                idUsuario = decoded.idUsuario;
                role = decoded.role;
            }
        });
        
        const dadosConsulta = await connection('combos').select('idCombo', 'usuarioId').where('idCombo', 'like', idCombo);
    
        if(dadosConsulta.length === 0 ) {
            throw new Error('Combo não existe!');
        }
        else if(idUsuario !== dadosConsulta[0].usuarioId && role === 'user') {
            throw new Error('Você precisa ter adicionado o combo ou ser admin para excluir');
        }

        await connection('combos').where('idCombo', idCombo).del();

        res.status(200).send('Combo deletado!');
    }
    catch (error) {
        if(error.message === 'Token inválido' || error.message === 'Combo não existe!' || error.message === 'Você precisa ter adicionado o combo ou ser admin para excluir' || error.message === 'Token e idCombo é obrigatório') {
            res.status(400).send(error.message);
        }
        else {
            res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor.' });
        }
    }
});

app.put('/combos/alterar', async (req: Request, res: Response) => {
    try {
        const {token, idCombo, nomePersonagem, jogo, combo, videoCombo} = req.body;
        let idUsuario, role;
        
        if(!nomePersonagem && !jogo && !combo && !videoCombo) {
            throw new Error('Você não passou nenhum valor para ser alterado');
        }

        if(!idCombo) {
            throw new Error('O id do combo não foi recebido');
        }

        if(!token) {
            throw new Error('O token não foi recebido');
        }

        jwt.verify(token, process.env.TOKEN_KEY, (err: any, decoded: any) => {
            if(err) {
                throw new Error('Token inválido');
            } 
            else {
                idUsuario = decoded.idUsuario;
                role = decoded.role;
            }
        });
        
        const dadosConsulta = await connection('combos').select('idCombo', 'usuarioId').where('idCombo', 'like', idCombo);

        if(dadosConsulta.length === 0 ) {
            throw new Error('Combo não existe!');
        }
        else if(idUsuario !== dadosConsulta[0].usuarioId && role === 'user') {
            throw new Error('Você precisa ter adicionado o combo ou ser admin para altera-lo');
        }

        if(nomePersonagem) {
            await connection('combos').where({idCombo: idCombo}).update({nomePersonagem: nomePersonagem});
        }
        if(jogo) {
            await connection('combos').where({idCombo: idCombo}).update({jogo: jogo});
        }
        if(combo) {
            await connection('combos').where({idCombo: idCombo}).update({combo: combo});
        }
        if(videoCombo) {
            await connection('combos').where({idCombo: idCombo}).update({videoCombo: videoCombo});
        }

        res.status(200).send('Alteração realizada!');
    }
    catch (error) {
        if(error.message === 'Combo não existe!' || error.message === 'Token inválido' || error.message === 'Você precisa ter adicionado o combo ou ser admin para altera-lo' || error.message === 'Você não passou nenhum valor para ser alterado' || error.message === 'O token não foi recebido') {
            res.status(400).send(error.message);
        }
        else{
            res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor.' });
        }
    }
});