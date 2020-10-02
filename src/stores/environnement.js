// export const SERVER = 'http://devcil';
// export const PORT = ':10010';
export const SERVER = 'http://devcil';
export const PORT = ':8082';
// export const SERVER_SUITE = "/web/services/GS_webservice/";
export const SERVER_SUITE = "/API/";
export const LISTE_SERVEURS = [
  {
    code: "TSTCIL",
    libelle: "Test CIL",
  },
  {
    code: "CILPRD",
    libelle: "Production CIL",
  },
  {
    code: "CELPRD",
    libelle: "Les Celliers associés",
  },
  {
    code: "PAYPRD",
    libelle: "Garun-Paysanne",
  },
];
export const FILE_LIBRARY = 'CCO';
export const FILE_SERVERS = "CCSRV1P1"; // Nom du fichier des webservers (temporaire)
export const FILE_SERVICES = "CCSRV2P1"; // Nom du fichier des webservices (temporaire)
export const FILE_PROPERTIES = "CCSRV3P1"; // Nom du fichier des properties (temporaire)
export const FILE_LOG = "CCSRVLP1"; // Nom du fichier des logs (temporaire)

export const ServerDoesNotExist = "IWS00240E"; // Erreur - Server does not exist
export const ServiceDoesNotExist = "IWS00202E"; // Erreur - WebService does not exist
export const CommandSuccessfull = "IWS00102I"; // OK - Commande exécutée avec succès
export const PermissionRefused = "IWS00107E"; // Erreur - Droits insuffisants.
export const ServiceExist = "IWS00207E"; // Erreur - Web service already exists.
export const ParameterValueNotValid = "IWS00103E"; // Erreur - Parameter value not valid.
export const OperationFailed = "IWS00999E"; // Erreur - Operation failed.

export const CONNEXION_API = {
  transport: "idb",
  transportOptions: {
    host: "*LOCAL",
  },
};

export const CHEMIN_IFS = "/tmp/wservice";
