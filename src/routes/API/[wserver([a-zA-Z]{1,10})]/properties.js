const { Connection, CommandCall } = require("itoolkit");
const { dbstmt, dbconn } = require("idb-connector");
const parseString = require("xml2js").parseString;
// const utils = require("../utils/utils");
import utils from "../../utils/utils";
import * as environnement from "../../../stores/environnement.js";

// const FileLibrary = "CCO";
// const FileLibrary = utils.citab3("CIL", "CI", "PGMPAR", "CCWS01");
const FileLibrary = environnement.FILE_LIBRARY;
// const FileServers = environnement.FILE_SERVERS;
// const FileServices = environnement.FILE_SERVICES;
const FileProperties = environnement.FILE_PROPERTIES;

/**
 * Propriétés d'un webserver
 */
export async function get(req, res) {
  console.log(`Propriétés d'un webserver : ${JSON.stringify(req.params)}`);

  const getWebServerProperties = `/QIBM/ProdData/OS/WebServices/bin/getWebServicesServerProperties.sh -server '${req.params.wserver}' | Rfile -wQ '${FileLibrary}/${FileProperties}'`;

  const connectioniToolkit = new Connection(environnement.CONNEXION_API);

  const command = new CommandCall({
    type: "qsh",
    command: getWebServerProperties,
  });
  // console.log(`getWebServerProperties : ${getWebServerProperties}`);

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
          // console.log("Commande getWebServerProperties : OK");
          const sql = `select trim(ldta) as "ldta"
                        from ${FileLibrary}.${FileProperties}
                        where ldta <> ''
                        for read only;`;

          const connectionDB2 = new dbconn(); // Create a connection object.
          connectionDB2.conn("*LOCAL"); // Connect to the database.

          const statement = new dbstmt(connectionDB2); // Create a statement object.

          let resultatSql = statement.execSync(sql);
          // console.log("Resultat sql : %O", resultatSql);

          statement.close(); // Clean up the statement object.
          connectionDB2.disconn(); // Disconnect from the database.
          connectionDB2.close(); // Clean up the connection object.

          let resultatFinal = { wsrvproperties: {} };

          resultatSql.forEach((element) => {
            if (element.ldta.substring(0, 9).trim() == "Job name:") {
              resultatFinal.wsrvproperties.name = element.ldta.substr(9).trim();
            }
            if (element.ldta.substring(0, 16).trim() == "Runtime user ID:") {
              resultatFinal.wsrvproperties.runtime_user_id = element.ldta
                .substr(16)
                .trim();
            }
            if (element.ldta.substring(0, 14).trim() == "Instance path:") {
              resultatFinal.wsrvproperties.instance_path = element.ldta
                .substr(14)
                .trim();
            }
            if (
              element.ldta.substring(0, 26).trim() ==
              "Web services install path:"
            ) {
              resultatFinal.wsrvproperties.webservices_install_path = element.ldta
                .substr(26)
                .trim();
            }
            if (element.ldta.substring(0, 10).trim() == "Subsystem:") {
              resultatFinal.wsrvproperties.subsystem = element.ldta
                .substr(9)
                .trim();
            }
            if (
              element.ldta.substring(0, 21).trim() == "Server log file name:"
            ) {
              resultatFinal.wsrvproperties.log_file_name = element.ldta
                .substr(21)
                .trim();
            }
            if (element.ldta.substring(0, 17).trim() == "HTTP server name:") {
              resultatFinal.wsrvproperties.http_name = element.ldta
                .substr(17)
                .trim();
            }
            if (element.ldta.substring(0, 18).trim() == "HTTP server ports:") {
              resultatFinal.wsrvproperties.http_ports = element.ldta
                .substr(18)
                .trim();
            }
          });

        //   res.status(200).send(resultatFinal);
          res.end(JSON.stringify(resultatFinal));
        });
      }
    });
  } catch {
    // res.status(500).send(JSON.stringify(result));
    res.statusCode = 500;
    res.end(JSON.stringify(result));
  }
}
