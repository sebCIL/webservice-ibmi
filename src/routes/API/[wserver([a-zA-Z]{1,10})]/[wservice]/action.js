const { Connection, CommandCall } = require("itoolkit");
const { dbstmt, dbconn } = require("idb-connector");
const parseString = require("xml2js").parseString;
import utils from "../../../utils/utils";
import * as environnement from "../../../../stores/environnement.js";

// const FileLibrary = utils.citab3("CIL", "CI", "PGMPAR", "CCWS01");
const FileLibrary = environnement.FILE_LIBRARY;
// const FileServers = environnement.FILE_SERVERS;
// const FileServices = environnement.FILE_SERVICES;
const FileLog = environnement.FILE_LOG;

// const ServerDoesNotExist = "IWS00240E"; // Erreur - Server does not exist
// const ServiceDoesNotExist = "IWS00202E"; // Erreur - WebService does not exist
// const CommandSuccessfull = "IWS00102I"; // OK - Commande exécutée avec succès
// const PermissionRefused = "IWS00107E"; // Erreur - Droits insuffisants.
// const ServiceExist = "IWS00207E"; // Erreur - Web service already exists.
// const ParameterValueNotValid = "IWS00103E"; // Erreur - Parameter value not valid.
// // Specified object XXXX not found.
// const OperationFailed = "IWS00999E"; // Erreur - Operation failed.

/**
 * Arrêt / Démarrage d'un webservice
 */
export async function get(req, res) {
  console.log(
    `Arrêt/Démarrage d'un webservice d'un webserver : : ${JSON.stringify(
      req.params
    )}`
  );

  let startStopWebService = "/QIBM/ProdData/OS/WebServices/bin/";
  let erreur = false;

  switch (req.params.action.toUpperCase()) {
    case "START":
      startStopWebService += "startWebService";
      break;
    case "STOP":
      startStopWebService += "stopWebService";
      break;
    default:
      // res.status(400).send("Action inconnue");
      res.statusCode = 400;
      res.end("Action inconnue");
      erreur = true;
      break;
  }

  if (!erreur) {
    startStopWebService += `.sh -server '${req.params.wserver}' -service '${req.params.wservice}' | Rfile -wQ '${FileLibrary}/${FileLog}'`;

    const connectioniToolkit = new Connection(environnement.CONNEXION_API);

    const command = new CommandCall({
      type: "qsh",
      command: startStopWebService,
    });
    // console.log(`startStopWebService : ${JSON.stringify(startStopWebService)}`);

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
            // console.log(
            //   `Error : ${JSON.stringify(result.myscript.qsh[0].error)}`
            // );
            // if (result.myscript.qsh[0].$.error) {
            //   res.status(500).send(result.myscript.qsh[0]);
            // } else {
            // console.log("Commande startStopWebService : OK");
            const sql = `select trim(substr(LDTA, 1, 9)) as "ldta"
                          from ${FileLibrary}.${FileLog}
                        where trim(ldta) <> ''
                        for read only;`;

            const connectionDB2 = new dbconn(); // Create a connection object.
            connectionDB2.conn("*LOCAL"); // Connect to the database.

            const statement = new dbstmt(connectionDB2); // Create a statement object.

            let resultatSql = statement.execSync(sql);
            // console.log(`Resultat sql: ${JSON.stringify(resultatSql)}`);

            statement.close(); // Clean up the statement object.
            connectionDB2.disconn(); // Disconnect from the database.
            connectionDB2.close(); // Clean up the connection object.

            const retour = utils.checkStatus(resultatSql[0].ldta);
            // @TODO : A externaliser dans utils/utils.js
            // switch (resultatSql[0].ldta) {
            //   case PermissionRefused:
            //     // res.status(403).send(PermissionRefused);
            //     res.statusCode = 403;
            //     res.end(PermissionRefused);
            //     erreur = true;
            //     break;
            //   case ServerDoesNotExist:
            //     // res.status(404).send(ServerDoesNotExist);
            //     res.statusCode = 404;
            //     res.end(ServerDoesNotExist);
            //     erreur = true;
            //     break;
            //   case ServiceDoesNotExist:
            //     // res.status(404).send(ServiceDoesNotExist);
            //     res.statusCode = 404;
            //     res.end(ServiceDoesNotExist);
            //     erreur = true;
            //     break;
            //   case CommandSuccessfull:
            //     // res.status(204).send(CommandSuccessfull);
            //     res.statusCode = 204;
            //     res.end(CommandSuccessfull);
            //     erreur = true;
            //     break;
            //   default:
            //     // res.status(500).send("Erreur inconnue");
            //     res.statusCode = 500;
            //     res.end("Erreur inconnue");
            //     erreur = true;
            //     break;
            // }
              res.statusCode = retour.status;
              res.end(retour.libelleStatus);
          });
        }
      });
    } catch {
      // res.status(500).send(JSON.stringify(result));
      res.statusCode = 500;
      res.end("Erreur dans la génération du fichier");
    }
  }
}