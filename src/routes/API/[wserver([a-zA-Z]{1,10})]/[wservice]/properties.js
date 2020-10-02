const { Connection, CommandCall } = require("itoolkit");
const { dbstmt, dbconn } = require("idb-connector");
const parseString = require("xml2js").parseString;
import utils from "../../../utils/utils";
import * as environnement from "../../../../stores/environnement.js";

// const FileLibrary = "CCO";
// const FileLibrary = utils.citab3("CIL", "CI", "PGMPAR", "CCWS01");
const FileLibrary = environnement.FILE_LIBRARY;
// const FileServers = environnement.FILE_SERVERS;
// const FileServices = environnement.FILE_SERVICES;
const FileProperties = environnement.FILE_PROPERTIES;

/**
 * Propriétés d'un webservice d'un webserver
 */
export async function get(req, res) {
  console.log(
    `Propriétés d'un webservice d'un webserver : ${JSON.stringify(req.params)}`
  );

  const getWebServiceProperties = `/QIBM/ProdData/OS/WebServices/bin/getWebServiceProperties.sh -server '${req.params.wserver}' -service '${req.params.wservice}' | Rfile -wQ '${FileLibrary}/${FileProperties}'`;

  const connectioniToolkit = new Connection(environnement.CONNEXION_API);

  const command = new CommandCall({
    type: "qsh",
    command: getWebServiceProperties,
  });
  // console.log("getWebServiceProperties : ", getWebServiceProperties);

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
          // console.log("Commande getWebServiceProperties : OK");
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

          let resultatFinal = { wsproperties: {} };

          resultatSql.forEach((element) => {
            // console.log("element : ", element.ldta.substring(0, 20).trim());
            switch (element.ldta.substring(0, 20).trim()) {
              case "Name:":
                resultatFinal.wsproperties.name = element.ldta
                  .substr(20)
                  .trim();
                break;
              case "Description:":
                resultatFinal.wsproperties.description = element.ldta
                  .substr(20)
                  .trim();
                break;
              case "Startup type:":
                resultatFinal.wsproperties.startup_type = element.ldta
                  .substr(20)
                  .trim();
                break;
              case "Status:":
                resultatFinal.wsproperties.status = element.ldta
                  .substr(20)
                  .trim();
                break;
              case "Runtime user ID:":
                resultatFinal.wsproperties.runtime_user_id = element.ldta
                  .substr(20)
                  .trim();
                break;
              case "Install path:":
                resultatFinal.wsproperties.install_path = element.ldta
                  .substr(20)
                  .trim();
                break;
              case "Program object path:":
                resultatFinal.wsproperties.program_object_path = element.ldta
                  .substr(22)
                  .trim();
                break;
              case "Library list:":
                resultatFinal.wsproperties.library_list = element.ldta
                  .substr(20)
                  .trim();
                break;
              default:
                // erreur = true;
                break;
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
