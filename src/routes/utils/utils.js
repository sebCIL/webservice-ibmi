const { dbstmt, dbconn } = require("idb-connector");

const ServerDoesNotExist = "IWS00240E"; // Erreur - Server does not exist
const ServiceDoesNotExist = "IWS00202E"; // Erreur - WebService does not exist
const CommandSuccessfull = "IWS00102I"; // OK - Commande exécutée avec succès
const PermissionRefused = "IWS00107E"; // Erreur - Droits insuffisants.
const ServiceExist = "IWS00207E"; // Erreur - Web service already exists.
const ParameterValueNotValid = "IWS00103E"; // Erreur - Parameter value not valid.
// Specified object XXXX not found.
const OperationFailed = "IWS00999E"; // Erreur - Operation failed.

exports.checkStatus = function(codeStatus){
  let statusRetour = {
    status: "",
    libelleStatus : ""
  };

  switch (codeStatus) {
    case PermissionRefused:
      statusRetour.codeStatus = 403;
      statusRetour.libelleStatus = PermissionRefused;
      break;
    case ServerDoesNotExist:
      statusRetour.codeStatus = 404;
      statusRetour.libelleStatus = ServerDoesNotExist;
      break;
    case ServiceDoesNotExist:
      statusRetour.codeStatus = 404;
      statusRetour.libelleStatus = ServiceDoesNotExist;
      break;
    case CommandSuccessfull:
      statusRetour.codeStatus = 204;
      statusRetour.libelleStatus = CommandSuccessfull;
      break;
    default:
      statusRetour.codeStatus = 500;
      statusRetour.libelleStatus = "Erreur inconnue";
      break;
  }

  return statusRetour;
}