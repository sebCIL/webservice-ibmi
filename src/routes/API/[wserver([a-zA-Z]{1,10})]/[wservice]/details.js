// const { Connection, CommandCall } = require("itoolkit");
const { dbstmt, dbconn } = require("idb-connector");
// const parseString = require("xml2js").parseString;
// import utils from "../../../utils/utils";
// import * as environnement from "../../../../stores/environnement.js";

// const FileLibrary = utils.citab3("CIL", "CI", "PGMPAR", "CCWS01");
// const FileServers = environnement.FILE_SERVERS;
// const FileServices = environnement.FILE_SERVICES;

/**
 * Détails d'un webservice d'un webserver
 */
export async function get(req, res) {
  console.log(
    `Détails d'un webservice d'un webserver : ${JSON.stringify(req.params)}`
  );

  // Recherche des infos dans les fichers
  // '/www/WSERVICE/webservices/services/FluxMntTrs/FluxMntTrs.pcml'
  // Lecture des points d'entrées
  const fichierPCML =
    "/www/" +
    req.params.wserver.trim() +
    "/webservices/services/" +
    req.params.wservice.trim() +
    "/" +
    req.params.wservice.trim() +
    ".pcml";

  let resultatFinal = {
    wsentrypoints: [],
  };

  const sql = `SELECT entrypoint as "entrypoint"
    , UPPER(entrypoint)  as "entrypointUpper"
    , restUriPathTemplate as "restUriPathTemplate"
    , restProduces as "restProduces"
    , restHttpRequestMethod as "restHttpRequestMethod"
    , RIGHT(trim(chemin), 4) as "extension"
    FROM XMLTABLE('$result/pcml/program'
  PASSING XMLPARSE(
        DOCUMENT
        GET_XML_FILE('${fichierPCML}')
  ) as "result"
    COLUMNS
   entrypoint CHAR(20) PATH '@name',
   restUriPathTemplate CHAR(250) PATH '@restUriPathTemplate',
   restProduces CHAR(20) PATH '@restProduces',
   restHttpRequestMethod char(10) PATH '@restHttpRequestMethod',
   chemin char(150) PATH '@path'
    ) AS TABLEXML;`;

  // console.log(`SQL :  ${sql}`);
  const connectionDB2 = new dbconn(); // Create a connection object.
  connectionDB2.conn("*LOCAL"); // Connect to the database.

  const statement = new dbstmt(connectionDB2); // Create a statement object.

  let resultatSql = statement.execSync(sql);

  statement.close(); // Clean up the statement object.

  resultatSql.forEach((elem) => {
    // console.log(`elem : ${elem}`);

    // ATTENTION ne ramène rien lorsqu'il s'agit d'un PGM et non d'un SRVPGM
    // Dans ce cas, il ne faut pas fitrer par @entrypoint
    let cheminXmltable;
    if (elem.extension.trim() == ".PGM") {
      cheminXmltable = "$result/pcml/program/data";
    } else {
      cheminXmltable =
        '$result/pcml/program[@entrypoint="' +
        elem.entrypointUpper.trim() +
        '"]/data';
    }

    // console.log(`cheminXmltable : ${cheminXmltable}`);
    const sqlDetail = `SELECT case when nom_parametre is not null then trim(nom_parametre) 
      when nom_parametre2 is not null then trim(nom_parametre2) 
                else '' end as "nom_parametre" 
                , case when nom_parametre is not null then 'path'
              when nom_parametre2 is not null then 'query'
              else '' end as "type_parametre" 
              , trim(ifnull(nom, '')) "nom_variable"
              , trim(ifnull("Input/Output", '')) "entree_sortie" 
              , trim(ifnull(type_var, '')) "type_variable" 
              , trim(ifnull(longueur, '')) "longueur" 
              , trim(ifnull(precision, '')) "precision_variable" 
              , trim(ifnull(defaultValue, '*NONE')) "valeur_defaut" 
              FROM XMLTABLE('${cheminXmltable}'
              PASSING XMLPARSE( 
                    DOCUMENT 
                    GET_XML_FILE('${fichierPCML}') 
              ) as "result" 
              COLUMNS 
                nom_parametre char(50) PATH '@restInPathParam' ,
                nom_parametre2 char(50) PATH '@restInQueryParam',
                nom CHAR(50) PATH '@name', 
                longueur CHAR(10) PATH '@length', 
                type_var VARCHAR(20) PATH '@type', 
                precision VARCHAR(20) PATH '@precision', 
                "Input/Output" VARCHAR(20) PATH '@usage', 
                defaultValue varchar(20) PATH '@restInParamDefaultValue' 
              ) AS TABLEXML;`;
    // console.log(`sqlDetail : ${sqlDetail}`);

    const statement = new dbstmt(connectionDB2); // Create a statement object.
    let resultatSqlDetail = statement.execSync(sqlDetail);

    // console.log(`resultatSqlDetail : ${JSON.stringify(resultatSqlDetail)}`);
    resultatFinal.wsentrypoints.push({
      entryPoint: elem.entrypoint.trim(),
      restUriPathTemplate: elem.restUriPathTemplate.trim(),
      restProduces: elem.restProduces.trim(),
      restHttpRequestMethod: elem.restHttpRequestMethod.trim(),
      champs: [...resultatSqlDetail],
    });
  });

  statement.close(); // Clean up the statement object.
  connectionDB2.disconn(); // Disconnect from the database.
  connectionDB2.close(); // Clean up the connection object.

  //   res.status(200).send(resultatFinal);
  res.end(JSON.stringify(resultatFinal));
}
