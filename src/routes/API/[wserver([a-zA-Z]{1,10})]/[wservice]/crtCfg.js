const { Connection, ProgramCall } = require("itoolkit");
// const { dbstmt, dbconn } = require("idb-connector");
const parseString = require("xml2js").parseString;
// const utils = require("../utils/utils");
import utils from "../../../utils/utils";
import * as environnement from "../../../../stores/environnement.js";

// const FileLibrary = utils.citab3("CIL", "CI", "PGMPAR", "CCWS01");
// const FileServers = environnement.FILE_SERVERS;
// const FileServices = environnement.FILE_SERVICES;

/**
 * Génération du fichier de configuration
 */
export async function get(req, res) {
  console.log(
    `Génération du fichier de configuration d'un webservice d'un webserver : ${JSON.stringify(
      req.params
    )}`
  );

  // Récupération du chemin du fichier
  // const FileConfiguration = utils.citab3("CIL", "CI", "PGMPAR", "CCWS01", 2);
  const FileConfiguration = environnement.CHEMIN_IFS;

  const getConfigurationFile = `QSH CMD('/QIBM/ProdData/OS/WebServices/bin/getConfigurationFile.sh -server ''${req.params.wserver}'' -locationDirectory ''${FileConfiguration}'' -serviceList ''${req.params.wservice}''')`;

  const connectioniToolkit = new Connection(environnement.CONNEXION_API);

  const program = new ProgramCall("CIUT0V", { lib: "CIL" });

  program.addParam({ value: getConfigurationFile, type: "256A" });
  program.addParam({ value: "", type: "256A" });
  program.addParam({
    value: "QCMDEXC   QSECOFR   *NOPWD    0",
    type: "256A",
  });

  // yy_CIUT0V.lfl1 = w$_lcmd;
  // wà_CIUT0V.LPGM = "QCMDEXC";
  // wà_CIUT0V.LPRF = "QSECOFR";
  // wà_CIUT0V.LPWD = "*NOPWD";
  // wà_CIUT0V.CRET = "0";

  const errno = {
    name: "error_code",
    type: "ds",
    io: "both",
    len: "rec2",
    fields: [
      {
        name: "bytes_provided",
        type: "10i0",
        value: 0,
        setlen: "rec2",
      },
      { name: "bytes_available", type: "10i0", value: 0 },
      { name: "msgid", type: "7A", value: "" },
      { type: "1A", value: "" },
    ],
  };

  connectioniToolkit.add(program);

  // console.log(`getConfigurationFile :  ${getConfigurationFile}`);

  connectioniToolkit.add(program);

  connectioniToolkit.run((error, xmlOutput) => {
    if (error) {
      res.status(500).send(JSON.stringify(error));
    } else {
      parseString(xmlOutput, (parseError, result) => {
        if (parseError) {
          res.status(500).send(JSON.stringify(parseError));
        }
        // console.log(`resultat :  ${result.myscript.pgm[0].parm[2].data[0]._}`);
        if (
          result.myscript.pgm[0].success &&
          result.myscript.pgm[0].parm[2].data[0]._ ==
            "QCMDEXC   QSECOFR   *NOPWD    1"
        ) {
        //   res.status(200).send("Génération du fichier : OK");
          res.end("Génération du fichier : OK");
        } else {
        //   res.status(500).send("Erreur dans la génération du fichier");
        res.statusCode = 500;
        res.end("Erreur dans la génération du fichier");
        }
      });
    }
  });
}
