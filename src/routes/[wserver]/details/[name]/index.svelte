<script context="module">
  import * as environnement from "../../../../stores/environnement.js";

  export function preload(page, session) {
    const { token } = session;

    if (!token) {
      return this.redirect(302, "/login/");
    }

    const wserver = page.params.wserver;
    const url = `${environnement.SERVER}${environnement.PORT}${environnement.SERVER_SUITE}${wserver}/${page.params.name}/details`;
    const wservice = page.params.name;

    return this.fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error("Erreur lors du chargement !");
        }
        if (res.status === 200) {
          return res.json();
        }
      })
      .then(data => {
        const detailWebservice = data;
        return {
          detailWebservice: detailWebservice,
          wserver: wserver,
          wservice: wservice
        };
      })
      .catch(err => {
        console.log(err);
        this.error(500, "Erreur lors du chargement !");
      });
  }
</script>

<script>
//   import { afterUpdate } from "svelte";
  import axios from "axios";
  import Swal from "sweetalert2";

  // Components
  import Header from "../../../../components/UI/Header.svelte";
  import NotifyMessage from "../../../../components/UI/NotifyMessage.svelte";
  import CarteDetail from "../../../../components/CarteDetail.svelte";

  // Stores
  
  export let detailWebservice;
  export let wserver;
  export let wservice;

  const titlePage = "Détail d'un webservice";
  const listeServeurs = environnement.LISTE_SERVEURS;
  let generationFichier = false;
  let codeServeur = "";
  let CommandInstall = "";

  function createConfigurationFile() {
    Swal.fire({
      title: "Génération",
      text: "Génération en cours ...",
      icon: "info",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    });

    const url = `${environnement.SERVER}${environnement.PORT}${environnement.SERVER_SUITE}${wserver}/${wservice}/crtCfg/`;

    axios({
      method: "get",
      url: url,
      mode: "cors"
    })
      .then(function(response) {
        Swal.close();
        Swal.fire({
          title: "Génération",
          text: "Génération terminée !",
          icon: "success",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false
        });
        generationFichier = true;
      })
      .catch(function(error) {
        // Fermeture du message d'attente
        Swal.close();

        // handle error
        console.log("server response : " + error);
        Swal.fire({
          title: "Erreur",
          text: "Contacter le CIL!",
          icon: "error"
        });
      });
  }

  function sendConfigurationFile() {
    Swal.fire({
      title: "Envoi",
      text: "Envoi en cours ...",
      icon: "info",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    });

    const url = `${environnement.SERVER}${environnement.PORT}${environnement.SERVER_SUITE}${wserver}/${wservice}/envoiCfg?serverIBMi=${codeServeur}`;

    axios({
      method: "get",
      url: url,
      mode: "cors"
    })
      .then(function(response) {
        Swal.close();
        Swal.fire({
          title: "Envoi",
          text: "Envoi terminée !",
          icon: "success",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false
        });
        // generationFichier = false;
        CommandInstall = response.data.CommandInstall;
      })
      .catch(function(error) {
        // Fermeture du message d'attente
        Swal.close();

        // handle error
        console.log("server response : " + error);
        Swal.fire({
          title: "Erreur",
          text: "Contacter le CIL!",
          icon: "error"
        });
      });
  }
</script>

<svelte:head>
  <title>{titlePage}</title>
</svelte:head>

<Header>{titlePage}</Header>

<section>
  <div class="row">
    <div class="left" style="padding-left: 1rem; padding-top:1rem;">
      <a
        href="{wserver}/"
        class="waves-effect waves-light btn"
        style="background-color: #34ace0;">
        <i class="material-icons left">arrow_back</i>
        retour
      </a>
    </div>
    <div class="right" style="padding-tight: 1rem; padding-top:1rem;">
      <a
        href="{wserver}/details/{wservice}/deploy"
        class="waves-effect waves-light btn"
        style="background-color: #34ace0;">
        <i class="material-icons right">send</i>
        Transférer
      </a>
    </div>
  </div>
  <div>
    {#if detailWebservice}
      <div class="row">
        {#each detailWebservice.wsentrypoints as detailWs}
          <section id="detailWebserver">
            <CarteDetail {detailWs} />
          </section>
        {/each}
      </div>

      <div class="divider" />
      <div class="center" style="padding-bottom: 1rem;">
        <h4 style="color: #ff6d00">
          Transférer le webservice sur une autre machine
        </h4>
        <h6 style="font-style: italic;">1ère étape : Générer le fichier</h6>
        <div class="col s12">
          <button
            on:click|preventDefault={createConfigurationFile}
            class="waves-effect waves-light btn"
            style="margin-left: 1rem;">
            <i class="material-icons right">insert_drive_file</i>
            Générer
          </button>
        </div>
      </div>
      {#if generationFichier}
        <div class="center">
          <h6 style="font-style: italic;">
            2ème étape : Sélectionner la machine de destination
          </h6>
          <div class="col s12">
            <div class="row center">
              {#each listeServeurs as serveur}
                <div class="col s3">
                  <label>
                    <input
                      name="serveur"
                      type="radio"
                      id="serveur"
                      value={serveur.code}
                      bind:group={codeServeur} />
                    <span>{serveur.libelle}</span>
                  </label>
                </div>
              {/each}
            </div>
          </div>
        </div>
        <div class="col s12 center" style="padding-bottom: 1rem;">
          <button
            on:click|preventDefault={sendConfigurationFile}
            class="waves-effect waves-light btn {codeServeur.length > 0 ? '' : 'disabled'}"
            style="margin-left: 1rem;">
            <i class="material-icons right">send</i>
            Envoyer
          </button>
        </div>
      {/if}

      {#if CommandInstall.length > 0}
        <NotifyMessage>
          <h5 style="color: #ff6d00">
            Commande à exécuter sur la machine {codeServeur}
          </h5>
          {CommandInstall}
        </NotifyMessage>
      {/if}
    {:else}
      <NotifyMessage>Pas de détails !</NotifyMessage>
    {/if}

  </div>
</section>
