const { Connection, CommandCall } = require("itoolkit");
const { dbstmt, dbconn } = require("idb-connector");
const parseString = require("xml2js").parseString;
import utils from "../../../utils/utils";
import fs from "fs";
import * as environnement from "../../../../stores/environnement.js";

// const FileLibrary = utils.citab3("CIL", "CI", "PGMPAR", "CCWS01");
// const FileServers = environnement.FILE_SERVERS;
// const FileServices = environnement.FILE_SERVICES;

/**
 * Envoi du fichier de configuration sur une autre machine
 */
export async function post(req, res) {
  console.log(
    `Envoi du fichier de configuration sur une autre machine : ${JSON.stringify(
      req.params
    )}\n Body : ${JSON.stringify(req.body)}`
  );

  const LIBRARY_LIST = "ws.iws.gen.librarylist=";
  const PROGRAM_OBJECT = "ws.iws.gen.programobject=";
  const serverIBMIMaj = req.query.serverIBMi;

  const libraryList = req.body.libraryList.trim();
  const programObject = req.body.programObject.trim();

  // Récupération du chemin du fichier
  // const FileConfiguration = utils.citab3("CIL", "CI", "PGMPAR", "CCWS01", 2);
  const FileConfiguration = environnement.CHEMIN_IFS;

  // Création d'un nouveau fichier avec le contenu adapté.
  const fichierProperties =
    FileConfiguration.trim() + req.params.wservice.trim() + ".properties";
  const fichierPropertiesNew =
    FileConfiguration.trim() + req.params.wservice.trim() + ".properties.txt";
  let programObject2;
  let erreur = false;

  let writer = fs.createWriteStream(fichierPropertiesNew);
  // console.log(`writer :  ${writer}`);
  if (writer) {
    try {
      // Lecture du fichier
      const data = fs.readFileSync(fichierProperties, "UTF-8");
      // découpage des lignes
      const lines = data.split(/\r?\n/);
      // pour chaque ligne
      lines.forEach((line) => {
        // Récupération des informations souhaitées
        if (line.length > 0) {
          if (
            line.substring(0, 23) == LIBRARY_LIST &&
            libraryList != ""
          ) {
            writer.write(LIBRARY_LIST + libraryList + "\r");
          } else if (line.substring(0, 25) == PROGRAM_OBJECT) {
            // console.log(`programObject : ${programObject2}`);
            const indexPgm = line.lastIndexOf('/');
            const pgm = line.substring(indexPgm);
            if (programObject != "") {
              const extension = line.substring(line.length - 3);
              writer.write(
                PROGRAM_OBJECT +
                  programObject.trim() +
                  pgm +
                  ";\r"
              );
              programObject2 =
                programObject +
                pgm;
            } else {
              programObject2 = line.substring(25);
              writer.write(line + "\r");
            }
          } else {
            // écriture dans le nouveau fichier
            writer.write(line + "\r");
          }
        }
      });
    } catch (err) {
      // console.log(`erreur lecture fichier :  ${err}`);
      erreur = true;
    }
    writer.end();
  } else {
    erreur = true;
    res.statusCode = 500;
    res.end(`Impossible de créer le fichier : ${fichierPropertiesNew}`);
  }

  if (!erreur) {
    // Envoi du fichier sur la machine distante
    const savRst = `SAVRST RMTLOCNAME(${serverIBMIMaj}) OBJ(('${fichierPropertiesNew}'))`;
    const connectioniToolkit = new Connection(environnement.CONNEXION_API);

    const command = new CommandCall({
      type: "cl",
      command: savRst,
    });
    // console.log(`savRst : ${savRst}`);

    connectioniToolkit.add(command);

    try {
      connectioniToolkit.run((error, xmlOutput) => {
        if (error) {
          throw error;
        } else {
          parseString(xmlOutput, (parseError, result) => {
            if (parseError) {
              throw parseError;
            }
            // console.log(`
            //   Envoi sur la machine distante :
            //   ${JSON.stringify(result.myscript)}`);
          });
        }
      });
    } catch {
      res.statusCode = 500;
      res.end("Erreur dans la génération du fichier");
    }

    // console.log(`programObject : ${programObject2}`);

    // Commande à exécuter sur la machine distante
    let CommandInstall = `Qsh Cmd('/QIBM/ProdData/OS/WebServices/bin/installwebservice.sh ' -server '' ${req.params.wserver.trim()} ' -propertiesFile ''${fichierPropertiesNew.trim()}'' -programObject ''${programObject2}''')`;

    //   res.status(200).send({ CommandInstall });
    res.end(JSON.stringify({ CommandInstall }));
  } else {
    res.statusCode = 500;
    res.end(`Erreur`);
  }
}
