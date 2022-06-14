const express = require('express');
const router = express.Router();
const path = require('path')

//anexar arquivo
const multer = require('multer');

const DIR = './uploads';

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, DIR);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
 
const upload = multer({storage: storage});



const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {    
});

//FUNÇÕES REFERENTES AO PERFIL ADMIN SIGMAONE

//ADICIONAR NOVO USUARIO, SOMENTE ADMIN
router.get('/newuser', isLoggedIn, (req, res) => {    
    res.render('links/newuser')
});

router.post('/newuser', isLoggedIn, (req, res) => {    
    const nomeusu = req.body.nomeusu;
    const senha = req.body.senha; 

    pool.query(`INSERT INTO sankhya.AD_TBLOGIN (NOMEUSU, SENHA, CLIENTSGO) VALUES('${nomeusu}','${senha}','S')`);
    
    res.redirect('/links/allogin')
});

//ADICIONAR CONTRATOS AOS NOVOS USUÁRIOS, SOMENTE ADMIN
router.get('/newcont', isLoggedIn, async (req, res) => {  
    
    const links = await pool.query(`SELECT 
    CODLOGIN,
    NOMEUSU,
    fullname,
    ADMINISTRADOR,
    REVENDA,
    CLIENTE,
    CLIENTSGO,
    '' AS OS
    FROM sankhya.AD_TBLOGIN
    WHERE CLIENTSGO = 'S'
    AND CODLOGIN <> 836
    ORDER BY NOMEUSU `); 

    //LISTAR CONTRATOS ATIVOS/ BONIFICADOS CDASTRADOS NA BASE
    const links2 = await pool.query(`SELECT DISTINCT 
    CON.NUMCONTRATO, 
    PAR.NOMEPARC   
        FROM sankhya.TCSCON CON 
        INNER JOIN sankhya.TGFPAR PAR ON (PAR.CODPARC = CON.CODPARC) 
        INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
        INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
        INNER JOIN sankhya.TGFCTT C ON (PAR.CODPARC=C.CODPARC)   
        WHERE CON.ATIVO = 'S'  
        AND CON.CODEMP=30
        ORDER BY CON.NUMCONTRATO`); 
   
    res.render('links/newcont',{lista: links.recordset,cont: links2.recordset})
});


router.post('/newcont', isLoggedIn, async (req, res) => {  

    const contrato = req.body.numcontrat;
    const login = req.body.login; 

    pool.query(`INSERT INTO sankhya.AD_TBACESSO (NUM_CONTRATO, ID_LOGIN) VALUES('${contrato}','${login}')`);
    
    req.flash('success', 'O Contrato foi Vincunlado com Sucesso!!!!')
    res.redirect('/links/allogin')
});

//ADICIONAR CLIENTE
router.get('/clientes/newclient', isLoggedIn, async (req, res) => {  

    const links = await pool.query(`SELECT 
    CODLOGIN,
    NOMEUSU,
    fullname,
    ADMINISTRADOR,
    REVENDA,
    CLIENTE,
    CLIENTSGO,
    '' AS OS
    FROM sankhya.AD_TBLOGIN
    WHERE CLIENTSGO = 'S'
    AND CODLOGIN <> 836 
    ORDER BY NOMEUSU`); 

    //LISTAR DE PARCEIROS CADASTRADOS PARA EMPRESA 30
    const links2 = await pool.query(`SELECT DISTINCT 
    PAR.CODPARC, 
    PAR.NOMEPARC
        FROM  sankhya.TGFPAR PAR  
        LEFT JOIN sankhya.TGFCAB C ON (PAR.CODPARC = C.CODPARC)
        WHERE C.CODEMP = 30
        ORDER BY PAR.CODPARC`); 
   
    res.render('links/clientes/newclient',{lista: links.recordset,cont: links2.recordset})
});

router.post('/clientes/newclient', isLoggedIn, async (req, res) => {  

    const codparc = req.body.codparc;
    const login = req.body.login; 

    pool.query(`UPDATE sankhya.AD_TBLOGIN SET CLIENTSGO2 = 1 WHERE CODLOGIN = '${login}'`);

    pool.query(`INSERT INTO sankhya.AD_CLIENTESGO (CODPARC,COD_LOGIN) VALUES('${codparc}','${login}')`);
    
    req.flash('success', 'O Cliente foi Cadastrado com Sucesso!!!!')
    res.redirect('/links/allogin')
});

//ADICIONAR REVENDA
router.get('/revenda/newrevenda', isLoggedIn, async (req, res) => {  

    const links = await pool.query(`SELECT 
    CODLOGIN,
    NOMEUSU,
    fullname,
    ADMINISTRADOR,
    REVENDA,
    CLIENTE,
    CLIENTSGO,
    '' AS OS
    FROM sankhya.AD_TBLOGIN
    WHERE CLIENTSGO = 'S'
    AND CODLOGIN <> 836 
    ORDER BY NOMEUSU`); 

    //LISTAR DE PARCEIROS CADASTRADOS PARA EMPRESA 30
    const links2 = await pool.query(`SELECT DISTINCT 
    PAR.CODPARC, 
    PAR.NOMEPARC
        FROM  sankhya.TGFPAR PAR  
        LEFT JOIN sankhya.TGFCAB C ON (PAR.CODPARC = C.CODPARC)
        WHERE C.CODEMP = 30
        ORDER BY PAR.CODPARC`); 
   
    res.render('links/revenda/newrevenda',{lista: links.recordset,cont: links2.recordset})
});

router.post('/revenda/newrevenda', isLoggedIn, async (req, res) => {  

    const codparc = req.body.codparc;
    const login = req.body.login; 

    pool.query(`UPDATE sankhya.AD_TBLOGIN SET REVENDA = 1 WHERE CODLOGIN = '${login}'`);

    pool.query(`INSERT INTO sankhya.AD_REVENDASGO (CODAGENCIADOR,COD_LOGIN) VALUES('${codparc}','${login}')`);
    
    req.flash('success', 'A Revenda foi Cadastrada com Sucesso!!!!')
    res.redirect('/links/allogin')
});

//ADICIONAR RASTREIO REVENDA
router.get('/revenda/rastreiorevenda', isLoggedIn, async (req, res) => {  

    const links = await pool.query(`SELECT 
    CODLOGIN,
    NOMEUSU,
    fullname,
    ADMINISTRADOR,
    REVENDA,
    CLIENTE,
    CLIENTSGO,
    '' AS OS
    FROM sankhya.AD_TBLOGIN
    WHERE CLIENTSGO = 'S'
    AND CODLOGIN <> 836 
    ORDER BY NOMEUSU`); 

    //LISTAR DE PARCEIROS CADASTRADOS PARA EMPRESA 30
    const links2 = await pool.query(`SELECT DISTINCT 
    PAR.CODPARC, 
    PAR.NOMEPARC
        FROM  sankhya.TGFPAR PAR  
        LEFT JOIN sankhya.TGFCAB C ON (PAR.CODPARC = C.CODPARC)
        WHERE C.CODEMP = 30
        ORDER BY PAR.CODPARC`); 
   
    res.render('links/revenda/rastreiorevenda',{lista: links.recordset,cont: links2.recordset})
});

router.post('/revenda/rastreiorevenda', isLoggedIn, async (req, res) => {  

    const codparc = req.body.codparc;
    const login = req.body.login; 

    pool.query(`UPDATE sankhya.AD_TBLOGIN SET REVENDA = 1 WHERE CODLOGIN = '${login}'`);

    pool.query(`INSERT INTO sankhya.AD_RASTREIOREV (CODPARC,COD_LOGIN) VALUES('${codparc}','${login}')`);

    pool.query(`INSERT INTO sankhya.AD_BOLETOCLIENTE (CODPARC,COD_LOGIN) VALUES('${codparc}','${login}')`);
    
    req.flash('success', 'Rastreio Vinculado com Sucesso!!!!')
    res.redirect('/links/allogin')
});


//ADD OS
router.get('/orderserv', isLoggedIn, async (req, res) => {
    const idlogin = req.user.CODLOGIN  

    //contrato
    const links = await pool.query(`SELECT DISTINCT L.NUM_CONTRATO, PAR.NOMEPARC,CON.AD_LOCALIDADE,
    PAR.CODPARC,  CON.CODUSUOS , L.ID_LOGIN,
    CON.AD_CIRCUITO,
    CD.NOMECID AS CIDADE,
    (CONVERT(VARCHAR(45),EN.NOMEEND,103)) as LOGRADOURO,
    CASE
         WHEN CON.AD_CODOCOROS IS NULL THEN 900
         ELSE CON.AD_CODOCOROS
       END AS CARTEIRA
    FROM sankhya.AD_TBACESSO L
    INNER JOIN sankhya.TCSCON CON ON (L.NUM_CONTRATO = CON.NUMCONTRATO)
    INNER JOIN sankhya.TGFPAR PAR ON (PAR.CODPARC = CON.CODPARC) 
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    INNER JOIN sankhya.TGFCTT C ON (PAR.CODPARC=C.CODPARC)
    LEFT JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = CON.NUSLA)
    LEFT JOIN sankhya.TCSRSL TC ON (SLA.NUSLA=TC.NUSLA)
    LEFT JOIN sankhya.TSIBAI BR ON (PAR.CODBAI=BR.CODBAI)
    LEFT JOIN sankhya.TSICID CD ON (CD.CODCID=PAR.CODCID)
    LEFT JOIN sankhya.TSIEND EN ON (EN.CODEND=PAR.CODEND)
    LEFT JOIN sankhya.TSIUFS UF ON (UF.UF=CD.UF)
    LEFT JOIN sankhya.TFPLGR LG ON (LG.CODLOGRADOURO=EN.CODLOGRADOURO)
    WHERE L.ID_LOGIN = ${idlogin}
    AND CON.ATIVO = 'S'
    AND PS.SITPROD IN ('A','B')
    AND PD.USOPROD IN ('S', 'R')
    AND TC.PRIORIDADE IS NULL
    ORDER BY CON.AD_CIRCUITO`);     
    
    //contatos
    const links2 = await pool.query(`SELECT DISTINCT 
    UPPER  (CONVERT(VARCHAR(30),c.NOMECONTATO,103))+' - '+CONVERT(VARCHAR(30),con.NUMCONTRATO,103)+' -'+
    CONVERT(VARCHAR(30),c.CODCONTATO,103) as CONTATO,
    c.CODCONTATO AS CODCONT,
    UPPER  (CONVERT(VARCHAR(30),c.NOMECONTATO,103)) as NOME
    from sankhya.TGFPAR P
    INNER JOIN sankhya.TGFCTT C ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSCON CON ON (P.CODPARC = CON.CODPARC)
    inner join sankhya.AD_TBACESSO L ON (L.NUM_CONTRATO = CON.NUMCONTRATO)
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    WHERE L.ID_LOGIN = ${idlogin}
    AND CON.ATIVO = 'S'
    AND PS.SITPROD IN ('A','B')
    AND PD.USOPROD='R'
    order by CONTATO`);

    //serviços
    const links3 = await pool.query(`SELECT DISTINCT 
    UPPER  (CONVERT(VARCHAR(50),PD.DESCRPROD,120))+' - '+CONVERT(VARCHAR(30),con.NUMCONTRATO,103)+' -'+
    CONVERT(VARCHAR(30),PS.CODPROD,103) as PRODUTO,
    con.NUMCONTRATO,
     PD.DESCRPROD, 
     PS.CODPROD
    from sankhya.TGFPAR P
    INNER JOIN sankhya.TGFCTT C ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSCON CON ON (P.CODPARC = CON.CODPARC)
    inner join sankhya.AD_TBACESSO L ON (L.NUM_CONTRATO = CON.NUMCONTRATO)
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    WHERE L.ID_LOGIN = ${idlogin}
    AND PS.SITPROD IN ('A','B')
    AND PD.USOPROD='S'
    order by PRODUTO`);

    //produtos
    const links4 = await pool.query(`SELECT DISTINCT 
    UPPER  (CONVERT(VARCHAR(50),PD.DESCRPROD,120))+' - '+CONVERT(VARCHAR(30),con.NUMCONTRATO,103)+' -'+
    CONVERT(VARCHAR(30),PS.CODPROD,103) as PRODUTO,
    con.NUMCONTRATO,
     PD.DESCRPROD, 
     PS.CODPROD
    from sankhya.TGFPAR P
    INNER JOIN sankhya.TGFCTT C ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSCON CON ON (P.CODPARC = CON.CODPARC)
    inner join sankhya.AD_TBACESSO L ON (L.NUM_CONTRATO = CON.NUMCONTRATO)
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    WHERE L.ID_LOGIN = ${idlogin}
    AND PS.SITPROD IN ('A','B')
    AND PD.USOPROD='R'
    order by PRODUTO`);

    res.render('links/testes', {geral: links.recordset, cont: links2.recordset, prod: links3.recordset, prod1: links4.recordset})
});

router.post('/orderserv', isLoggedIn, upload.single('file'), async (req, res) => {    

    const links = await pool.query('select top (1) NUMOS +1 as NUMOS from sankhya.TCSOSE order by numos desc');  
    const numos = Object.values(links.recordset[0])    

    const texto = req.body.texto;
    const filetoupload = upload
    const contrato = req.body.contrato; 
    const parceiro = req.body.codparc;
    const produto = req.body.codprod; 
    const servico = req.body.codserv; 
    const contato = req.body.atualiza; 
    //const slccont = req.body.sla;
    const cart = req.body.carteira;

    //verificação cód prioridade sla
    const links2 = await pool.query(`SELECT DISTINCT 
    CASE WHEN CON.AD_CIRCUITO IS NULL
        THEN 
            CASE  WHEN (DATEPART(DW,GETDATE() )) = 7   
         THEN
                CASE 
                WHEN ((TC.VALORTEMPO/100)*60) < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0)) 
                --add apenas 360
                THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                DATEADD(DD, 2, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))			
    
                WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=600
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 3, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
               
               WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=601 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1200
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-600) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 4, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
    
            
                WHEN 
                    (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=1201 AND
                    (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1800
                                THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1200) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                                DATEADD(DD, 5, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
                ELSE
                        
                
                DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1800) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 6, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))		
                END 
    
        --SLA DOMINGO
        WHEN (DATEPART(DW,GETDATE() )) = 1
        THEN
                CASE WHEN ((TC.VALORTEMPO/100)*60) < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0)) 
                
                THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                DATEADD(DD, 1, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))			
                 
                WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=600
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 2, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
               
               WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=601 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1200
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-600) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 3, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
    
            
                WHEN 
                    (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=1201 AND
                    (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1800
                                THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1200) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                                DATEADD(DD, 4, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
                ELSE
                        
                
                DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1800) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 5, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
                END
    
        --SLA TERÇA-FEIRA
        WHEN (DATEPART(DW,GETDATE() )) = 3
        THEN
                CASE WHEN ((TC.VALORTEMPO/100)*60) < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0)) 
                --mesmo dia
                THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((TC.VALORTEMPO/100)*60), GETDATE()))
    
                --D+1
                WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=600
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 1, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
    
               --D+2
               WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=601 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1200
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-600) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 2, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))			
    
            --D+3
            WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=1201 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1800
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1200) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 3, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
            ELSE
                        
                --D+4
                DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1800) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 6, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
                END
    
        --SLA QUARTA-FEIRA
        WHEN (DATEPART(DW,GETDATE() )) = 4
        THEN
                CASE WHEN ((TC.VALORTEMPO/100)*60) < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0)) 
                --mesmo dia
                THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((TC.VALORTEMPO/100)*60), GETDATE()))
    
                --D+1
                WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=600
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 1, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
    
               --D+2
               WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=601 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1200
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-600) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 2, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))			
    
            --D+3
            WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=1201 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1800
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1200) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 5, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
            ELSE
                        
                --D+4
                DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1800) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 6, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
                END
    
        --SLA QUINTA-FEIRA
        WHEN (DATEPART(DW,GETDATE() )) = 5
        THEN
                CASE WHEN ((TC.VALORTEMPO/100)*60) < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0)) 
                --mesmo dia
                THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((TC.VALORTEMPO/100)*60), GETDATE()))
    
                --D+1
                WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=600
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 1, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
    
               --D+2
               WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=601 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1200
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-600) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 4, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))			
    
            --D+3
            WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=1201 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1800
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1200) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 5, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
            ELSE
                        
                --D+4
                DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1800) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 6, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
                END
    
        --SLA SEXTA-FEIRA
        WHEN (DATEPART(DW,GETDATE() )) = 6
        THEN
                CASE WHEN ((TC.VALORTEMPO/100)*60) < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0)) 
                --mesmo dia
                THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((TC.VALORTEMPO/100)*60), GETDATE()))
    
                --D+1
                WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=600
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 3, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
    
               --D+2
               WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=601 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1200
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-600) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 4, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))			
    
            --D+3
            WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=1201 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1800
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1200) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 5, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
            ELSE
                        
                --D+4
                DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1800) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 6, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
                END
    
        ELSE
    
            --SLA SEGUNDA-FEIRA
            --NO MESMO DIA
            CASE WHEN ((TC.VALORTEMPO/100)*60) < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0)) 
                --mesmo dia
                THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((TC.VALORTEMPO/100)*60), GETDATE()))
    
                --D+1
                WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=600
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 1, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
    
               --D+2
               WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=601 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1200
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-600) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 2, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))			
    
            --D+3
            WHEN 
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >=1201 AND
                (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) >= 0 and (((TC.VALORTEMPO/100)*60) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ) <=1800
                            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1200) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 3, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))	
            ELSE
                        
                --D+4
                DATEDIFF(MI, GETDATE(), DATEADD(MI, ((((TC.VALORTEMPO/100)*60)-1800) - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.SAIDA, 2)+':'+RIGHT(CH.SAIDA, 2))),111)),0) ), 
                            DATEADD(DD, 4, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ',(LEFT(CH.ENTRADA, 1)+':'+RIGHT(CH.ENTRADA, 2))),111))))
    
                END END
            
        ELSE       
        CASE WHEN CON.AD_CIRCUITO IS NOT NULL AND TC.PADRAO = 'N' AND TC.CODSERV = 42430 
            THEN ((TC.VALORTEMPO/100)*60)
    
            WHEN CON.AD_CIRCUITO IS NOT NULL AND TC.PADRAO = 'N' AND TC.CODSERV = 42431 
            THEN ((TC.VALORTEMPO/100)*60)
    
            WHEN CON.AD_CIRCUITO IS NOT NULL AND TC.PADRAO = 'N' AND TC.CODSERV = 42432 
            THEN ((TC.VALORTEMPO/100)*60)
    
            WHEN CON.AD_CIRCUITO IS NOT NULL AND TC.PADRAO = 'N' AND TC.CODSERV = 42433 
            THEN ((TC.VALORTEMPO/100)*60)
    
            WHEN CON.AD_CIRCUITO IS NOT NULL AND TC.PADRAO = 'N' AND TC.CODSERV = 42434 
            THEN ((TC.VALORTEMPO/100)*60)
    
            WHEN CON.AD_CIRCUITO IS NOT NULL AND TC.PADRAO = 'N' AND TC.CODSERV = 42431 
            THEN ((TC.VALORTEMPO/100)*60)
    
            WHEN CON.AD_CIRCUITO IS NOT NULL AND TC.PADRAO = 'N' AND TC.CODSERV = 42435 
            THEN ((TC.VALORTEMPO/100)*60)
            
            WHEN CON.AD_CIRCUITO IS NOT NULL AND TC.PADRAO = 'N' AND TC.CODSERV = 42438 
            THEN ((TC.VALORTEMPO/100)*60)  
        END
    END
    
     AS VALORTEMPO 
    FROM sankhya.AD_TBACESSO L
    INNER JOIN sankhya.TCSCON CON ON (L.NUM_CONTRATO = CON.NUMCONTRATO)  
    LEFT JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = CON.NUSLA)
    LEFT JOIN sankhya.TCSRSL TC ON (SLA.NUSLA=TC.NUSLA)
    LEFT JOIN sankhya.TFPCGH TH ON (TH.CODCARGAHOR=SLA.CODCARGAHOR)  
    LEFT JOIN sankhya.TFPHOR CH ON (TH.CODCARGAHOR=CH.CODCARGAHOR)     
    WHERE CON.NUMCONTRATO='${contrato}'   
    AND (TC.CODSERV = '${produto}' OR TC.CODSERV IS NULL)
    AND CON.ATIVO = 'S'
    AND TC.PADRAO = (CASE WHEN CON.AD_CIRCUITO IS NOT NULL THEN 'N' ELSE 'S' END)
    AND CH.ENTRADA IS NOT NULL
    AND CH.SAIDA IS NOT NULL
`);
    //const prioridade = Object.values(links2.recordset[0]) 
	const prioridade = 1440 

    /* console.log('prioridade')
    console.log(prioridade)

    console.log('CONTRATO')
    console.log(contrato)

    console.log('servico')
    console.log(produto) */


    await pool.query(`INSERT INTO sankhya.TCSOSE (NUMOS,NUMCONTRATO,DHCHAMADA,DTPREVISTA,CODPARC,CODCONTATO,CODATEND,CODUSURESP,DESCRICAO,SITUACAO,CODCOS,CODCENCUS,CODOAT,POSSUISLA) VALUES 
    ('${numos}','${contrato}',GETDATE(),(SELECT DATEADD(MI,${prioridade},GETDATE())),'${parceiro}','${contato}',110,110,'${texto}','P','',30101,1000000,'S');
    INSERT INTO SANKHYA.TCSITE (NUMOS,NUMITEM,CODSERV,CODPROD,CODUSU,CODOCOROS,CODUSUREM,DHENTRADA,DHPREVISTA,CODSIT,COBRAR,RETRABALHO) VALUES 
    ('${numos}',1,'${produto}','${servico}',1245,'${cart}',110,GETDATE(),(SELECT DATEADD(MI,${prioridade},GETDATE())),15,'N','N');
    INSERT INTO sankhya.TSIATA (CODATA,DESCRICAO,ARQUIVO,CONTEUDO,CODUSU,DTALTER,TIPO) VALUES ('${numos}','ANEXO','${filetoupload}','${filetoupload}',1006,GETDATE(),'W')
`); 
    
    req.flash('success', 'Ordem De Serviço Criada com Sucesso!!!!')
    res.redirect('/links')
    
});
//FIM ATIVIDADES ADMIM SIGMONE

//PAGINAS DATATABLES 
//LISTAR TODAS AS OS ABERTAS
router.get('/', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    C.NUMCONTRATO, 
    P.NOMEPARC,    
    O.NUMOS, 
    I.NUMITEM,
    USU.NOMEUSU AS EXECUTANTE,
    CONVERT(VARCHAR(30),O.DHCHAMADA,103)+' '+ CONVERT(VARCHAR(30),O.DHCHAMADA,108) AS ABERTURA,
    CONVERT(VARCHAR(30),O.DTPREVISTA,103)+' '+ CONVERT(VARCHAR(30),O.DTPREVISTA,108) AS PREVISAO,    
    CONVERT(NVARCHAR(MAX),O.DESCRICAO)AS DEFEITO,
    CONVERT(NVARCHAR(MAX),I.SOLUCAO) AS SOLUCAO,
    CID.NOMECID AS CIDADE,
    UFS.UF,
    SLA.DESCRICAO AS DESCRICAO_SLA,
    O.AD_MOTIVO_OI AS MOTIVO,
    O.AD_SOLICITANTE_OI AS SOLICITANTE,
    AD_TIPO_OI AS TIPO,
    ITS.DESCRICAO

    FROM sankhya.TCSOSE O
    INNER JOIN sankhya.TCSCON C ON (C.NUMCONTRATO=O.NUMCONTRATO)
    INNER JOIN sankhya.AD_TBACESSO AC ON (C.NUMCONTRATO=AC.NUM_CONTRATO)
    INNER JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSITE I ON (O.NUMOS=I.NUMOS)
    INNER JOIN SANKHYA.TSIUSU USU ON (USU.CODUSU = I.CODUSU)

    LEFT JOIN SANKHYA.TCSITS ITS ON (ITS.CODSIT = I.CODSIT)
    LEFT JOIN SANKHYA.TGFCPL CPL ON (P.CODPARC = CPL.CODPARC)
    LEFT JOIN SANKHYA.TSICID CID ON (CPL.CODCIDENTREGA = CID.CODCID)
    LEFT JOIN SANKHYA.TSIUFS UFS ON (CID.UF = UFS.CODUF)
    LEFT JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = C.NUSLA)

    WHERE 
    O.NUFAP IS NULL
    AND I.TERMEXEC IS NULL
    AND I.NUMITEM = (SELECT MAX(NUMITEM) FROM SANKHYA.TCSITE WHERE NUMOS = O.NUMOS AND TERMEXEC IS NULL)
    AND O.DHCHAMADA >= '01/01/2021'
    AND AC.ID_LOGIN= ${idlogin}`);
    res.render('links/list', { lista: links.recordset });
});

//LISTAR TODAS AS OS FECHADAS
router.get('/osclose', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    C.NUMCONTRATO, 
    P.NOMEPARC,    
    O.NUMOS, 
    I.NUMITEM,
    CONVERT(VARCHAR(10), O.DHCHAMADA, 120)  AS ABERTURA2,
    CONVERT(VARCHAR(30),O.DHCHAMADA,103)+' '+ CONVERT(VARCHAR(30),O.DHCHAMADA,108) AS ABERTURA,
    CONVERT(VARCHAR(30),O.DTFECHAMENTO,103)+' '+ CONVERT(VARCHAR(30),O.DTFECHAMENTO,108) AS DT_FECHAMENTO,
    CONVERT(VARCHAR(30),I.TERMEXEC,103)+' '+ CONVERT(VARCHAR(30),I.TERMEXEC,108) AS DT_EXECUCAO,  
    CONVERT(NVARCHAR(MAX),O.DESCRICAO)AS DEFEITO,
    CONVERT(NVARCHAR(MAX),I.SOLUCAO) AS SOLUCAO,
    U.NOMEUSU AS RESPONSAVEL,
    USU.NOMEUSU AS EXECUTANTE,
    TSIUSU.NOMEUSU AS FECHADA,

    CID.NOMECID AS CIDADE,
    UFS.UF,
    SLA.DESCRICAO AS DESCRICAO_SLA,
    O.AD_MOTIVO_OI AS MOTIVO,
    O.AD_SOLICITANTE_OI AS SOLICITANTE,
    AD_TIPO_OI AS TIPO

    FROM sankhya.TCSOSE O
    INNER JOIN sankhya.TCSCON C ON (C.NUMCONTRATO=O.NUMCONTRATO)
    INNER JOIN sankhya.AD_TBACESSO AC ON (C.NUMCONTRATO=AC.NUM_CONTRATO)
    INNER JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSITE I ON (O.NUMOS=I.NUMOS)
    INNER JOIN sankhya.TSIUSU     ON (TSIUSU.CODUSU = O.CODUSUFECH)
    INNER JOIN sankhya.TSIUSU USU ON (USU.CODUSU = I.CODUSU)
    INNER JOIN sankhya.TSIUSU U ON (O.CODUSURESP=U.CODUSU)

    LEFT JOIN SANKHYA.TCSITS ITS ON (ITS.CODSIT = I.CODSIT)
    LEFT JOIN SANKHYA.TGFCPL CPL ON (P.CODPARC = CPL.CODPARC)
    LEFT JOIN SANKHYA.TSICID CID ON (CPL.CODCIDENTREGA = CID.CODCID)
    LEFT JOIN SANKHYA.TSIUFS UFS ON (CID.UF = UFS.CODUF)
    LEFT JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = C.NUSLA)

    WHERE 
    O.NUFAP IS NULL
    AND O.SITUACAO = 'F'
    AND I.TERMEXEC = (SELECT DISTINCT MAX (TERMEXEC) FROM SANKHYA.TCSITE WHERE NUMOS = O.NUMOS)
    AND O.DHCHAMADA >= DATEADD(DAY, -60, GETDATE())
    AND AC.ID_LOGIN= ${idlogin}`);
    res.render('links/osclose', { lista: links.recordset });
});

//listar todas as OS registradas para o parceiro
router.get('/all', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    C.NUMCONTRATO, 
    P.NOMEPARC,    
    O.NUMOS,
    (CASE O.SITUACAO WHEN 'F' THEN 'Fechada'ELSE 'Aberta' END) AS SITUACAO, 
    I.NUMITEM,
    CONVERT(VARCHAR(10), O.DHCHAMADA, 120)  AS ABERTURA2,
    CONVERT(VARCHAR(30),O.DHCHAMADA,103)+' '+ CONVERT(VARCHAR(30),O.DHCHAMADA,108) AS ABERTURA,
    CONVERT(VARCHAR(30),O.DTFECHAMENTO,103)+' '+ CONVERT(VARCHAR(30),O.DTFECHAMENTO,108) AS DT_FECHAMENTO,
    CONVERT(VARCHAR(30),I.TERMEXEC,103)+' '+ CONVERT(VARCHAR(30),I.TERMEXEC,108) AS DT_EXECUCAO,  
    CONVERT(NVARCHAR(MAX),O.DESCRICAO)AS DEFEITO,
    
    (CASE  WHEN O.SITUACAO ='P' THEN  '' ELSE I.SOLUCAO END )  AS SOLUCAO,
    CONVERT(NVARCHAR(MAX),I.SOLUCAO) AS SOLUCAOA,
    U.NOMEUSU AS RESPONSAVEL,
    USU.NOMEUSU AS EXECUTANTE,
    TSIUSU.NOMEUSU AS FECHADA,

    CID.NOMECID AS CIDADE,
    UFS.UF,
    SLA.DESCRICAO AS DESCRICAO_SLA,
    O.AD_MOTIVO_OI AS MOTIVO,
    O.AD_SOLICITANTE_OI AS SOLICITANTE,
    AD_TIPO_OI AS TIPO,
    ITS.DESCRICAO

    FROM sankhya.TCSOSE O
    INNER JOIN sankhya.TCSCON C ON (C.NUMCONTRATO=O.NUMCONTRATO)
    INNER JOIN sankhya.AD_TBACESSO AC ON (C.NUMCONTRATO=AC.NUM_CONTRATO)
    INNER JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSITE I ON (O.NUMOS=I.NUMOS)
    INNER JOIN sankhya.TSIUSU     ON (TSIUSU.CODUSU = O.CODUSUFECH)
    INNER JOIN sankhya.TSIUSU USU ON (USU.CODUSU = I.CODUSU)
    INNER JOIN sankhya.TSIUSU U ON (O.CODUSURESP=U.CODUSU)

    LEFT JOIN SANKHYA.TCSITS ITS ON (ITS.CODSIT = I.CODSIT)
    LEFT JOIN SANKHYA.TGFCPL CPL ON (P.CODPARC = CPL.CODPARC)
    LEFT JOIN SANKHYA.TSICID CID ON (CPL.CODCIDENTREGA = CID.CODCID)
    LEFT JOIN SANKHYA.TSIUFS UFS ON (CID.UF = UFS.CODUF)
    LEFT JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = C.NUSLA)

    WHERE 
    O.NUFAP IS NULL
    AND O.SITUACAO in ('P','F')
    AND I.NUMITEM = (SELECT DISTINCT MAX (NUMITEM) FROM SANKHYA.TCSITE WHERE NUMOS = O.NUMOS)
    AND O.DHCHAMADA >= DATEADD(DAY, -60, GETDATE())
    AND AC.ID_LOGIN= ${idlogin}`);
    res.render('links/all', { lista: links.recordset });
});

//LISTAGEM REFERENTE AO AGENCIAMENTO 
//LISTA APENAS QUANDO OS USUÁRIOS LOGADOS FOREM REVENDAS SIGMAONE (RECEBIDOS)
router.get('/revenda/revenda', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT
    DISTINCT
    CAB.NUNOTA AS NR_UNICO,
    CAB.NUMNOTA AS NOTA,
    CONVERT(VARCHAR(30),CAB.DTNEG,103) AS DATA,    
    VEN.APELIDO AS VENDEDOR,
    CAB.CODMOTORISTA as COD_AGE,
    PAR1.NOMEPARC AS AGENCIADOR,
    T.DESCROPER AS DESCR_TOP,
    CAB.CODPARC AS COD_CLIENTE,
    PAR.NOMEPARC AS CLIENTE,     
    FORMAT(CAB.VLRNOTA*T.GOLDEV, 'C', 'pt-br') AS VLR_NOTA,
    FORMAT((CAB.VLRNOTA - CAB.VLRSUBST - CAB.VLRIPI - CAB.VLRFRETE - CAB.VLRICMSDIFALDEST - CAB.VLRICMSFCP)*T.GOLDEV, 'C', 'pt-br') AS VLR_NOTA_SEM_IMPOST,
    FORMAT(FIN.VLRDESDOB*T.GOLDEV, 'C', 'pt-br') AS PARCELA_FINANCEIRO,
    FORMAT((CASE WHEN CAB.AD_PERCAGE IS NOT NULL THEN FIN.VLRDESDOB*(((CAB.VLRNOTA - CAB.VLRSUBST - CAB.VLRIPI - CAB.VLRFRETE - VLRICMSDIFALDEST
    - CAB.VLRICMSFCP)*(CAB.AD_PERCAGE/100))/CAB.VLRNOTA)
    WHEN CAB.AD_VLRAGENC IS NOT NULL THEN FIN.VLRDESDOB*(CAB.AD_VLRAGENC/CAB.VLRNOTA) ELSE 0 END)*T.GOLDEV, 'C', 'pt-br') AS VLR_AGENCIAMENTO,  
    CONVERT(VARCHAR(30),FIN.DHBAIXA ,103) AS DT_BAIXA,
    CASE FIN.AD_AGENPAGO WHEN 'N' THEN 'NÃO'  END AS PAGO
    
    FROM sankhya.TGFCAB CAB
    INNER JOIN sankhya.TCSCON C ON (CAB.NUMCONTRATO=C.NUMCONTRATO)
    INNER JOIN sankhya.TGFFIN FIN ON CAB.NUNOTA = FIN.NUNOTA
    INNER JOIN sankhya.TGFTOP T ON (T.CODTIPOPER = CAB.CODTIPOPER AND T.DHALTER = CAB.DHTIPOPER)
    INNER JOIN sankhya.TGFPAR PAR ON (CAB.CODPARC = PAR.CODPARC)
    INNER JOIN sankhya.TGFPAR PAR1 ON (PAR1.CODPARC = CAB.CODMOTORISTA)
    INNER JOIN sankhya.TGFVEN VEN ON (CAB.CODVEND = VEN.CODVEND)
    INNER JOIN sankhya.AD_REVENDASGO RV ON (RV.CODAGENCIADOR = PAR1.CODPARC)
    INNER JOIN sankhya.AD_TBLOGIN L ON (L.CODLOGIN=RV.COD_LOGIN)
    
    WHERE
    CAB.CODTIPOPER IN (667,701,713,673,674,707,667,719,723,724)
    AND CAB.CODEMP =30
    AND CAB.STATUSNOTA = 'L'
    AND FIN.DHBAIXA >= '01/01/2022'
    AND CAB.CODMOTORISTA <> 0
    AND (FIN.AD_AGENPAGO IS NULL OR FIN.AD_AGENPAGO = 'N')
    AND L.CODLOGIN =  ${idlogin}`);
    res.render('links/revenda/revenda', { lista: links.recordset });
});

//LISTA APENAS QUANDO OS USUÁRIOS LOGADOS FOREM REVENDAS SIGMAONE (A RECEBER)
router.get('/revenda/revendareceb', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT
    DISTINCT
    CAB.NUNOTA AS NR_UNICO,
    CAB.NUMNOTA AS NOTA,
    CONVERT(VARCHAR(30),CAB.DTNEG,103)  AS DATA,
    VEN.APELIDO AS VENDEDOR,
    CAB.CODMOTORISTA as COD_AGE,
    PAR1.NOMEPARC AS AGENCIADOR,
    T.DESCROPER AS DESCR_TOP,
    CAB.CODPARC AS COD_CLIENTE,
    PAR.NOMEPARC AS CLIENTE,
    FORMAT(CAB.VLRNOTA*T.GOLDEV, 'C', 'pt-br') AS VLR_NOTA,
    FORMAT((CAB.VLRNOTA - CAB.VLRSUBST - CAB.VLRIPI - CAB.VLRFRETE - CAB.VLRICMSDIFALDEST - CAB.VLRICMSFCP)*T.GOLDEV, 'C', 'pt-br') AS VLR_NOTA_SEM_IMPOST,
    FORMAT(FIN.VLRDESDOB*T.GOLDEV, 'C', 'pt-br') AS PARCELA_FINANCEIRO,
    FORMAT((CASE WHEN CAB.AD_PERCAGE IS NOT NULL THEN FIN.VLRDESDOB*(((CAB.VLRNOTA - CAB.VLRSUBST - CAB.VLRIPI - CAB.VLRFRETE - VLRICMSDIFALDEST
    - CAB.VLRICMSFCP)*(CAB.AD_PERCAGE/100))/CAB.VLRNOTA)
    WHEN CAB.AD_VLRAGENC IS NOT NULL THEN FIN.VLRDESDOB*(CAB.AD_VLRAGENC/CAB.VLRNOTA) ELSE 0 END)*T.GOLDEV, 'C', 'pt-br') AS VLR_AGENCIAMENTO, 
    CONVERT(VARCHAR(30),FIN.DTVENC,103)  AS DT_VENC,
    CASE FIN.AD_AGENPAGO WHEN 'N' THEN 'NÃO'  END AS PAGO
    
    FROM sankhya.TGFCAB CAB
    INNER JOIN sankhya.TCSCON C ON (CAB.NUMCONTRATO=C.NUMCONTRATO)
    INNER JOIN sankhya.TGFFIN FIN ON CAB.NUNOTA = FIN.NUNOTA
    INNER JOIN sankhya.TGFTOP T ON (T.CODTIPOPER = CAB.CODTIPOPER AND T.DHALTER = CAB.DHTIPOPER)
    INNER JOIN sankhya.TGFPAR PAR ON (CAB.CODPARC = PAR.CODPARC)
    INNER JOIN sankhya.TGFPAR PAR1 ON (PAR1.CODPARC = CAB.CODMOTORISTA)
    INNER JOIN sankhya.TGFVEN VEN ON (CAB.CODVEND = VEN.CODVEND)
    INNER JOIN sankhya.AD_REVENDASGO RV ON (RV.CODAGENCIADOR = PAR1.CODPARC)
    INNER JOIN sankhya.AD_TBLOGIN L ON (L.CODLOGIN=RV.COD_LOGIN)
    WHERE 
    CAB.CODTIPOPER IN (667,701,713,673,674,707,667,719,723,724)
    AND CAB.CODEMP =30
    AND CAB.STATUSNOTA = 'L'
    AND FIN.DHBAIXA IS NULL
    AND CAB.CODMOTORISTA <> 0
    AND (FIN.AD_AGENPAGO IS NULL OR FIN.AD_AGENPAGO = 'N')
    AND L.CODLOGIN = ${idlogin}`);
    res.render('links/revenda/revendareceb', { lista: links.recordset });
});

//LISTA APENAS QUANDO OS USUÁRIOS LOGADOS FOREM REVENDAS SIGMAONE (A RECEBER)
router.get('/revenda/revendapg', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT
    DISTINCT
    CAB.NUNOTA AS NR_UNICO,
    CAB.NUMNOTA AS NOTA,
    CONVERT(VARCHAR(30),CAB.DTNEG,103)  AS DATA,
    VEN.APELIDO AS VENDEDOR,
    CAB.CODMOTORISTA as COD_AGE,
    PAR1.NOMEPARC AS AGENCIADOR,
    T.DESCROPER AS DESCR_TOP,
    CAB.CODPARC AS COD_CLIENTE,
    PAR.NOMEPARC AS CLIENTE,
    FORMAT(CAB.VLRNOTA*T.GOLDEV, 'C', 'pt-br') AS VLR_NOTA,
    FORMAT((CAB.VLRNOTA - CAB.VLRSUBST - CAB.VLRIPI - CAB.VLRFRETE - CAB.VLRICMSDIFALDEST - CAB.VLRICMSFCP)*T.GOLDEV, 'C', 'pt-br') AS VLR_NOTA_SEM_IMPOST,
    FORMAT(FIN.VLRDESDOB*T.GOLDEV, 'C', 'pt-br') AS PARCELA_FINANCEIRO,
    FORMAT((CASE WHEN CAB.AD_PERCAGE IS NOT NULL THEN FIN.VLRDESDOB*(((CAB.VLRNOTA - CAB.VLRSUBST - CAB.VLRIPI - CAB.VLRFRETE - VLRICMSDIFALDEST
    - CAB.VLRICMSFCP)*(CAB.AD_PERCAGE/100))/CAB.VLRNOTA)
    WHEN CAB.AD_VLRAGENC IS NOT NULL THEN FIN.VLRDESDOB*(CAB.AD_VLRAGENC/CAB.VLRNOTA) ELSE 0 END)*T.GOLDEV, 'C', 'pt-br') AS VLR_AGENCIAMENTO, 
    CONVERT(VARCHAR(30),FIN.DTVENC,103)  AS DT_VENC,
    CASE FIN.AD_AGENPAGO WHEN 'S' THEN 'SIM'  END AS PAGO
    
    FROM sankhya.TGFCAB CAB
    INNER JOIN sankhya.TCSCON C ON (CAB.NUMCONTRATO=C.NUMCONTRATO)
    INNER JOIN sankhya.TGFFIN FIN ON CAB.NUNOTA = FIN.NUNOTA
    INNER JOIN sankhya.TGFTOP T ON (T.CODTIPOPER = CAB.CODTIPOPER AND T.DHALTER = CAB.DHTIPOPER)
    INNER JOIN sankhya.TGFPAR PAR ON (CAB.CODPARC = PAR.CODPARC)
    INNER JOIN sankhya.TGFPAR PAR1 ON (PAR1.CODPARC = CAB.CODMOTORISTA)
    INNER JOIN sankhya.TGFVEN VEN ON (CAB.CODVEND = VEN.CODVEND)
    INNER JOIN sankhya.AD_REVENDASGO RV ON (RV.CODAGENCIADOR = PAR1.CODPARC)
    INNER JOIN sankhya.AD_TBLOGIN L ON (L.CODLOGIN=RV.COD_LOGIN)
    WHERE 
    CAB.CODTIPOPER IN (667,701,713,673,674,707,667,719,723,724)
    AND CAB.CODEMP =30
    AND CAB.STATUSNOTA = 'L'
    AND CAB.CODMOTORISTA <> 0
    AND FIN.AD_AGENPAGO = 'S'
    AND L.CODLOGIN = ${idlogin}`);
    res.render('links/revenda/revendapg', { lista: links.recordset });
});

//LISTA RASTREIO 
//LISTA RASTREIO CLIENTES SIGMAONE
router.get('/clientes/rastreio', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT  
    NUREGISTRO,
    CTE,
    CAST(LINKRASTREIO AS NVARCHAR(100)) AS LINK,
    F.NFSAIDA,
    CAB.CODPARC
    FROM SANKHYA.AD_FRETESIGMA F
    INNER JOIN sankhya.TGFCAB CAB ON (F.NFSAIDA=CAB.NUMNOTA)
    INNER JOIN SANKHYA.TGFPAR P ON (CAB.CODPARC=P.CODPARC)
    INNER JOIN SANKHYA.AD_CLIENTESGO CL ON (CL.CODPARC=P.CODPARC)
    WHERE 
    NUREGISTRO = (SELECT MAX(NUREGISTRO) FROM SANKHYA.AD_FRETESIGMA WHERE NFSAIDA = CAB.NUMNOTA)
    AND CAB.DTNEG = (SELECT MAX(DTNEG) FROM SANKHYA.TGFCAB WHERE NUMNOTA = CAB.NUMNOTA)
    AND CL.COD_LOGIN = ${idlogin}
    GROUP BY NUREGISTRO, F.CTE,F.NFSAIDA,CAST(LINKRASTREIO AS NVARCHAR(100)), CAB.CODPARC
    ORDER BY NFSAIDA`);
    res.render('links/clientes/rastreio', { lista: links.recordset });
});

//LISTA RASTREIO REVENDAS SIGMAONE
router.get('/revenda/listarastreio', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT   
    NUREGISTRO,
    CTE,
    CAST(LINKRASTREIO AS NVARCHAR(100)) AS LINK,
    FR.NFSAIDA,
    CAB.CODPARC,
    PAR.NOMEPARC
    FROM SANKHYA.AD_FRETESIGMA FR
    INNER JOIN SANKHYA.TGFCAB CAB ON CAB.NUMNOTA = FR.NFSAIDA
    LEFT JOIN SANKHYA.TGFPAR PAR ON PAR.CODPARC = CAB.CODPARC
    LEFT JOIN sankhya.AD_REVENDASGO RV ON (CAB.CODMOTORISTA=RV.CODAGENCIADOR)
    WHERE  CAB.CODEMP = 30
    AND CAB.NUMNOTA <> 0
    AND CAB.NUMNOTA <> 1
    AND FR.NUREGISTRO = (SELECT MAX(NUREGISTRO) FROM SANKHYA.AD_FRETESIGMA WHERE NFSAIDA = CAB.NUMNOTA)
    AND CAB.CODMOTORISTA  =RV.CODAGENCIADOR
    AND RV.COD_LOGIN = ${idlogin}    
    ORDER BY PAR.NOMEPARC`);
    res.render('links/revenda/listarastreio', { lista: links.recordset });
});

//FINANCEIRO GERAL CLIENTE
//HISTÓRICO BOLETO CLIENTES SIGMAONE
/* router.get('/clientes/hitorico-boletos', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    F.NUNOTA,
    F.DTNEG,
    F.DESDOBRAMENTO,
    F.DTVENC,
    CONVERT(VARCHAR(30), F.DHBAIXA, 103) AS DHBAIXA,
    F.NOSSONUM,
    F.LINHADIGITAVEL,
    F.VLRBAIXA
    FROM sankhya.TGFFIN F
    LEFT JOIN sankhya.TGFCAB C ON (C.NUNOTA=F.NUNOTA)
    LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.AD_CLIENTESGO CS ON (P.CODPARC=CS.CODPARC)
    WHERE F.CODEMP = 30 
    AND NOSSONUM IS NOT NULL
    AND LINHADIGITAVEL IS NOT NULL
    AND CS.COD_LOGIN=${idlogin}
    AND DHBAIXA IS NOT NULL
    AND RECDESP = 1
    ORDER BY NUNOTA,DESDOBRAMENTO,DTVENC,DHBAIXA`);
    res.render('links/clientes/hitorico-boletos', { lista: links.recordset });
}); */

//BOLETO EM ABERTO CLIENTES SIGMAONE
router.get('/clientes/boletos-abertos', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    F.NUNOTA AS N_UNICO,
    C.NUMNOTA AS NUNOTA,
    F.DTNEG,
    F.DESDOBRAMENTO,
    CONVERT(VARCHAR(30), F.DTVENC, 103) AS DTVENC, 
    P.CGC_CPF AS CNPJ,
    F.NOSSONUM,
    F.LINHADIGITAVEL,
    FORMAT(F.VLRDESDOB, 'C', 'pt-br') AS VLRDESDOB   
    FROM sankhya.TGFFIN F
    LEFT JOIN sankhya.TGFCAB C ON (C.NUNOTA=F.NUNOTA)
    LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.AD_CLIENTESGO CS ON (P.CODPARC=CS.CODPARC)
    WHERE F.CODEMP = 30 
    AND NOSSONUM IS NOT NULL
    AND LINHADIGITAVEL IS NOT NULL
    AND CS.COD_LOGIN=${idlogin}
    AND DHBAIXA IS NULL
    AND RECDESP = 1
    ORDER BY F.DTVENC,NUNOTA,DESDOBRAMENTO,DHBAIXA`);
    res.render('links/clientes/boletos-abertos', { lista: links.recordset });
});

//NOTA FISCAL CLIENTES SIGMAONE
router.get('/clientes/notafiscal-cliente', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT C.NUMNOTA,
    CONVERT(VARCHAR(30), C.DTNEG, 103) AS DTNEG,    
    C.CODVEND,
    V.APELIDO AS VENDEDOR,
    FORMAT(C.VLRNOTA, 'C', 'pt-br') AS VLRNOTA     
        FROM  sankhya.TGFCAB C
        INNER JOIN sankhya.TGFVEN V ON (C.CODVEND=V.CODVEND)
        LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
        INNER JOIN sankhya.AD_CLIENTESGO CS ON (P.CODPARC=CS.CODPARC)
        WHERE 
        CS.COD_LOGIN=${idlogin}
        AND C.CODEMP = 30
        AND C.STATUSNOTA = 'L'
        AND C.TIPMOV = 'V'
        ORDER BY C.DTNEG`);
    res.render('links/clientes/notafiscal-cliente', { lista: links.recordset });
});

//FINANEIRO GERAL REVENDA
//HISTÓRICO BOLETO REVENDAS SIGMAONE (MINHAS NOTAS)
/* router.get('/revenda/hitorico-boletos', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    F.NUNOTA,
    F.DTNEG,
    F.DESDOBRAMENTO,
    F.DTVENC,
    CONVERT(VARCHAR(30), F.DHBAIXA, 103) AS DHBAIXA,
    F.NOSSONUM,
    F.LINHADIGITAVEL,
    F.VLRBAIXA
    FROM sankhya.TGFFIN F
    LEFT JOIN sankhya.TGFCAB C ON (C.NUNOTA=F.NUNOTA)
    LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.AD_REVENDASGO RV ON (C.CODMOTORISTA=RV.CODAGENCIADOR)
    WHERE F.CODEMP = 30 
    AND NOSSONUM IS NOT NULL
    AND LINHADIGITAVEL IS NOT NULL
    AND RV.COD_LOGIN=${idlogin}
    AND DHBAIXA IS NOT NULL
    AND RECDESP = 1
    AND P.CLASSIFICMS = 'R'
    ORDER BY NUNOTA,DESDOBRAMENTO,DTVENC,DHBAIXA`);
    res.render('links/revenda/hitorico-boletos', { lista: links.recordset });
}); */

//BOLETO EM ABERTO REVENDAS SIGMAONE (MINHAS NOTAS)
router.get('/revenda/boletos-abertos', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    F.NUNOTA AS N_UNICO,
    C.NUMNOTA AS NUNOTA,
    F.DTNEG,
    F.DESDOBRAMENTO,
    CONVERT(VARCHAR(30), F.DTVENC, 103) AS DTVENC, 
    P.CGC_CPF AS CNPJ,
    F.NOSSONUM,
    F.LINHADIGITAVEL,
    FORMAT(F.VLRDESDOB, 'C', 'pt-br') AS VLRDESDOB   
    FROM sankhya.TGFFIN F
    LEFT JOIN sankhya.TGFCAB C ON (C.NUNOTA=F.NUNOTA)
    LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.AD_REVENDASGO RV ON (P.CODPARC=RV.CODAGENCIADOR)
    WHERE F.CODEMP = 30 
    AND NOSSONUM IS NOT NULL
    AND LINHADIGITAVEL IS NOT NULL
    AND RV.COD_LOGIN=${idlogin}
    AND DHBAIXA IS NULL
    AND RECDESP = 1
    ORDER BY F.DTVENC,NUNOTA,DESDOBRAMENTO,DHBAIXA`);
    res.render('links/revenda/boletos-abertos', { lista: links.recordset });
});

//NOTA FISCAL REVENDAS SIGMAONE
router.get('/revenda/notafiscal-revenda', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT C.NUMNOTA,
    CONVERT(VARCHAR(30), C.DTNEG, 103) AS DTNEG,    
    C.CODVEND,
    V.APELIDO AS VENDEDOR,
    FORMAT(C.VLRNOTA, 'C', 'pt-br') AS VLRNOTA 
FROM sankhya.TGFCAB C
INNER JOIN sankhya.TGFVEN V ON (C.CODVEND=V.CODVEND)
LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
INNER JOIN sankhya.AD_REVENDASGO RV ON (RV.CODAGENCIADOR=C.CODPARC)
WHERE RV.COD_LOGIN = ${idlogin}
AND C.VLRNOTA IS NOT NULL
AND C.CODEMP = 30
AND C.STATUSNOTA = 'L'
AND C.TIPMOV = 'V'
ORDER BY C.DTNEG`);
    res.render('links/revenda/notafiscal-revenda', { lista: links.recordset });
});

//HISTÓRICO BOLETO CLIENTES SIGMAONE (VISÃO REVENDA)
/* router.get('/revenda/hitorico-boletos-clientes', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    F.NUNOTA,
    F.DTNEG,
    F.DESDOBRAMENTO,
    F.DTVENC,
    CONVERT(VARCHAR(30), F.DHBAIXA, 103) AS DHBAIXA,
    F.NOSSONUM,
    F.LINHADIGITAVEL,
    F.VLRBAIXA
    FROM sankhya.TGFFIN F
    LEFT JOIN sankhya.TGFCAB C ON (C.NUNOTA=F.NUNOTA)
    LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.AD_BOLETOCLIENTE CBL ON (P.CODPARC=CBL.CODPARC)
    WHERE F.CODEMP = 30 
    AND NOSSONUM IS NOT NULL
    AND LINHADIGITAVEL IS NOT NULL
    AND CBL.COD_LOGIN=${idlogin}
    AND DHBAIXA IS NOT NULL
    AND RECDESP = 1
    ORDER BY NUNOTA,DESDOBRAMENTO,DTVENC,DHBAIXA`);
    res.render('links/revenda/hitorico-boletos-clientes', { lista: links.recordset });
}); */

//BOLETO EM ABERTO CLIENTES SIGMAONE (VISÃO REVENDA)
router.get('/revenda/boletos-abertos-clientes', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    F.NUNOTA AS N_UNICO,
    C.NUMNOTA AS NUNOTA,
    F.DTNEG,
    F.DESDOBRAMENTO,
    CONVERT(VARCHAR(30), F.DTVENC, 103) AS DTVENC, 
    P.NOMEPARC AS CLIENTE,
    P.CGC_CPF AS CNPJ,
    F.NOSSONUM,
    F.LINHADIGITAVEL,
    FORMAT(F.VLRDESDOB, 'C', 'pt-br') AS VLRDESDOB   
    FROM sankhya.TGFFIN F
    LEFT JOIN sankhya.TGFCAB C ON (C.NUNOTA=F.NUNOTA)
    LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    LEFT JOIN sankhya.AD_REVENDASGO RV ON (C.CODMOTORISTA=RV.CODAGENCIADOR)
    WHERE F.CODEMP = 30 
    AND NOSSONUM IS NOT NULL
    AND LINHADIGITAVEL IS NOT NULL 
    AND RV.COD_LOGIN=${idlogin}
    AND C.CODMOTORISTA IN (RV.CODAGENCIADOR)
    AND DHBAIXA IS NULL
    AND RECDESP = 1
    ORDER BY F.DTVENC,P.NOMEPARC,NUNOTA,DESDOBRAMENTO,DHBAIXA`);
    res.render('links/revenda/boletos-abertos-clientes', { lista: links.recordset });
});

//NOTA FISCAL CLIENTE (VISÃO REVENDA)
router.get('/revenda/notafiscal-cliente', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT C.NUNOTA,
    C.NUMNOTA,
        CONVERT(VARCHAR(30), C.DTNEG, 103) AS DTNEG,
        p.NOMEPARC AS CLIENTE,    
        C.CODVEND,
        V.APELIDO AS VENDEDOR,
        RV.CODAGENCIADOR,
        FORMAT(C.VLRNOTA, 'C', 'pt-br') AS VLRNOTA 
    FROM sankhya.TGFCAB C
    INNER JOIN sankhya.TGFVEN V ON (C.CODVEND=V.CODVEND)
    LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    LEFT JOIN sankhya.AD_REVENDASGO RV ON (C.CODMOTORISTA=RV.CODAGENCIADOR)
    WHERE C.CODMOTORISTA =RV.CODAGENCIADOR
    AND RV.COD_LOGIN = ${idlogin}
    AND C.CODEMP = 30
    AND C.STATUSNOTA = 'L'
    AND C.TIPMOV = 'V'
    ORDER BY P.NOMEPARC,C.DTNEG`);
    res.render('links/revenda/notafiscal-cliente', { lista: links.recordset });
});

//NOTA FISCAL CLIENTE (VISÃO REVENDA) teste
router.get('/revenda/nf_cliente', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    F.NUNOTA,
    F.DTNEG,
    F.DESDOBRAMENTO,
    CONVERT(VARCHAR(30), F.DTVENC, 103) AS DTVENC, 
    F.NOSSONUM,
    F.LINHADIGITAVEL,    
    F.VLRDESDOB 
    FROM sankhya.TGFFIN F
    LEFT JOIN sankhya.TGFCAB C ON (C.NUNOTA=F.NUNOTA)
    LEFT JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.AD_BOLETOCLIENTE CBL ON (P.CODPARC=CBL.CODPARC)
    WHERE F.CODEMP = 30 
    AND NOSSONUM IS NOT NULL
    AND LINHADIGITAVEL IS NOT NULL
    AND CBL.COD_LOGIN=${idlogin}
    AND F.NUNOTA=956818
    AND DHBAIXA IS NULL
    AND f.DESDOBRAMENTO =3
    AND RECDESP = 1
    ORDER BY NUNOTA,DESDOBRAMENTO,DTVENC,DHBAIXA`);
    res.render('links/revenda/nf_cliente', { lista: links.recordset });
});

//LISTA ESTOQUE REVENDAS SIGMAONE
router.get('/revenda/estoque', isLoggedIn,  async (req, res) => {
    const links = await pool.query(`SELECT
    Estoque.CODEMP,
    Estoque.CODPROD,
    Produto.DESCRPROD,
    Produto.NCM,
    Produto.FABRICANTE,
    Grupo.DESCRGRUPOPROD,
    Estoque.ESTOQUE,
    (Estoque.ESTOQUE - Estoque.RESERVADO) AS SALDO_DISPONIVEL,
    Estoque.CODLOCAL
     
    FROM
    sankhya.TGFEST Estoque
    full JOIN sankhya.TGFPRO Produto ON (Produto.CODPROD = Estoque.CODPROD)
    full JOIN sankhya.TGFGRU Grupo ON (Grupo.CODGRUPOPROD = Produto.CODGRUPOPROD)
     
    WHERE
    Estoque.CODPARC = '0' AND
    
    Estoque.ATIVO = 'S' AND
    Estoque.CODEMP = 30 AND
    Estoque.CODLOCAL IN ( 9301,9305)
     
    GROUP BY Estoque.CODEMP, Estoque.CODPROD,
    Produto.DESCRPROD,
    Produto.NCM,
    Produto.FABRICANTE,
    Estoque.ESTOQUE,
    Estoque.CODLOCAL,
    Grupo.DESCRGRUPOPROD,
    Estoque.RESERVADO`);
    res.render('links/revenda/estoque', { lista: links.recordset });
});

//LISTAGEM DE REGISTROS REFERENTES AOS USUÁRIOS ADMINISTRADORES
//listar todos os usuários (login) cadastrados
router.get('/allogin', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    CODLOGIN,
    NOMEUSU,
    fullname,ADMINISTRADOR,
    CASE REVENDA WHEN 1 THEN 'Sim' END REVENDA,
    CASE CLIENTE WHEN 1 THEN 'Sim' END CLIENTE,
    CLIENTSGO,
    CASE WHEN AC.NUM_CONTRATO is not NULL THEN 'Sim' END OS,
    AC.NUM_CONTRATO
    FROM sankhya.AD_TBLOGIN L
    LEFT JOIN sankhya.AD_TBACESSO AC ON (L.CODLOGIN=AC.ID_LOGIN)
    WHERE CLIENTSGO = 'S'
    AND CODLOGIN <> 836`);
    res.render('links/allogin', { lista: links.recordset });
});

//listar todas os clientes sigma cadastrada (admin_sigmaone)
router.get('/revenda/listrevenda', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT RV.CODAGENCIADOR, RV.NOME_AGEN, L.NOMEUSU AS LOGIN
    FROM sankhya.AD_REVENDASGO RV
    INNER JOIN sankhya.AD_TBLOGIN L ON (L.CODLOGIN=RV.COD_LOGIN)`);
    res.render('links/revenda/listrevenda', { lista: links.recordset });
});

//listar todos as revendas sigma cadastrada (admin_sigmaone)
router.get('/clientes/liscliente', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT CS.CODPARC,P.NOMEPARC, L.NOMEUSU AS LOGIN
    FROM sankhya.AD_CLIENTESGO CS
    INNER JOIN sankhya.TGFPAR P ON (CS.CODPARC=P.CODPARC)
    INNER JOIN sankhya.AD_TBLOGIN L ON (L.CODLOGIN=CS.COD_LOGIN)`);
    res.render('links/clientes/liscliente', { lista: links.recordset });
});

//DELETE UPDATE 

//remover parceiro
router.get('/delete/:id', isLoggedIn,  async (req, res) => {
    const {id}  = req.params;
    await pool.query(`DELETE FROM sankhya.AD_TBPARCEIRO WHERE ID = ${id}`);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

//editar parceiro - exibição tela
router.get('/edit/:id', isLoggedIn,  async (req, res) => {
    const {id}  = req.params;
    const links = await pool.query(`SELECT * FROM sankhya.AD_TBPARCEIRO WHERE ID = ${id}`);
    res.render('links/edit', { lista: links.recordset[0] })
    /*//req.flash('success', 'Link Removed Successfully');
    res.redirect('/links'); */
});

//update
//ADICIONAR CONTRATOS AOS NOVOS USUÁRIOS, SOMENTE ADMIN
router.get('/password', isLoggedIn, async (req, res) => {  
   
    res.render('links/passwords')
});

router.post('/password', isLoggedIn, async (req, res) => {  
    const idlogin = req.user.CODLOGIN  
    const contrato = req.body.contrato;    

    console.log('contrato')
    console.log(contrato)

    console.log('login')
    console.log(idlogin)

    pool.query(`UPDATE sankhya.AD_TBLOGIN
            SET SENHA = '${contrato}'
            WHERE CODLOGIN = '${idlogin}'`);   
    
    req.flash('success', 'Senha atualizada com Sucesso!!!!')
    res.redirect('/signin')
});

module.exports = router; 