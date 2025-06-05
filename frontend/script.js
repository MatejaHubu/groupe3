let tasks = [];
let editingId = null; // 🔁 Si on édite une tâche

const API_URL = 'https://api.mistral.ai/v1/chat/completions';
const API_URL_BDD = "https://152.228.134.45:3000/api/taches";
const API_KEY = 'fWurjXt4w5Zte3bn1kuOfibKqIWzLsw2';  // Remplace par ta vraie clé API


document.addEventListener("DOMContentLoaded", () => {
  loadTasks();

  document.getElementById("taskForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const titre = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const charge = parseInt(document.getElementById("charge").value);

    const task = {
      id: editingId || crypto.randomUUID(),
      titre,
      description,
      charge,
      statut: "à faire"
    };

    if (editingId) {
      updateTask(task);
    } else {
      createTask(task);
    }

    this.reset();
    editingId = null;
    this.querySelector("button[type='submit']").textContent = "Ajouter tâche";
  });
});






document.getElementById("taskForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const titre = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDesc").value;
  const charge = parseInt(document.getElementById("charge").value);

  if (taskEditingId) {
    // Mode édition
    const task = tasks.find(t => t.id === taskEditingId);
    task.titre = titre;
    task.description = description;
    task.charge = charge;
    taskEditingId = null;
    this.querySelector("button[type='submit']").textContent = "Ajouter tâche";
  } else {
    // Nouvelle tâche
    const task = {
      id: crypto.randomUUID(),
      titre,
      description,
      charge,
      statut: "à faire"
    };
    insertTache(task);
  }

  saveAndRender();
  this.reset();
});


function saveAndRender() {
  loadTasks(() => {
    renderTasks();
  });
}

function loadTasks() {
  fetch(API_URL_BDD)
    .then(res => res.json())
    .then(data => {
      tasks = data;
      renderTasks();
    })
    .catch(err => console.error("Erreur de chargement :", err));
}

function createTask(task) {
  fetch(API_URL_BDD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task)
  })
    .then(() => loadTasks())
    .catch(err => console.error("Erreur d'ajout :", err));
}

function updateTask(task) {
  fetch(`${API_URL_BDD}/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task)
  })
    .then(() => loadTasks())
    .catch(err => console.error("Erreur de mise à jour :", err));
}

function deleteTask(id) {
  fetch(`${API_URL_BDD}/${id}`, {
    method: "DELETE"
  })
    .then(() => loadTasks())
    .catch(err => console.error("Erreur de suppression :", err));
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById("taskTitle").value = task.titre;
  document.getElementById("taskDesc").value = task.description;
  document.getElementById("charge").value = task.charge;

  editingId = task.id;
  document.querySelector("#taskForm button[type='submit']").textContent = "Modifier tâche";
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = `task charge-${task.charge}`;
    div.innerHTML = `
    ${getChargeTag(task.charge)}
    <h3>${task.titre}</h3>
    <p>${task.description}</p>
    <button onclick="editTask('${task.id}')">✏️ Modifier</button>
    <button onclick="deleteTask('${task.id}')">❌ Supprimer</button>
    `;

    list.appendChild(div);
  });
}




function getChargeEmoji(charge) {
  switch(charge) {
    case 1: return "🟢";
    case 3: return "🟡";
    case 5: return "🔴";
    default: return "⚪";
  }
}

function getChargeTag(charge) {
  if (charge <= 2) {
    return `<span class="tag vert">🧠 léger</span>`;
  } else if (charge <= 4) {
    return `<span class="tag jaune">🧠 modéré</span>`;
  } else {
    return `<span class="tag rouge">🧠 élevé</span>`;
  }
}


function exportTasks() {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "todolist.json";
  a.click();
}

// 🎙️ Web Speech API
function startVoiceInput(composant) {
  const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.onresult = function (event) {
    const text = event.results[0][0].transcript;
    document.getElementById(composant).value = text;
  };
  recognition.start();
}



function analyseTaskAI(titre, desc) {
  const suggestionDiv = document.getElementById("aiSuggestion");
  let messages = [];

  // Découpage si la tâche semble trop large
  if (titre.length > 30 || titre.includes("et") || titre.includes("puis")) {
    messages.push("🔍 Cette tâche semble complexe. Souhaitez-vous la découper en plusieurs sous-tâches ?");
  }

  // Suggestions automatiques
  if (titre.toLowerCase().includes("rapport")) {
    messages.push("📎 Pensez à : 1) Écrire le brouillon, 2) Relire, 3) Envoyer à votre responsable.");
  }

  // Priorisation
  if (desc.length > 50 && document.getElementById("charge").value >= 4) {
    messages.push("🚨 Charge mentale élevée + tâche longue. Marquez-la comme prioritaire.");
  }

  // Affichage
  suggestionDiv.innerHTML = messages.length ? messages.join("<br>") : "";
}


document.getElementById("taskTitle").addEventListener("input", () => {
  analyseTaskAI(
    document.getElementById("taskTitle").value,
    document.getElementById("taskDesc").value
  );
});

document.getElementById("taskDesc").addEventListener("input", () => {
  analyseTaskAI(
    document.getElementById("taskTitle").value,
    document.getElementById("taskDesc").value
  );
});


const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};


 document.getElementById('iaButton').addEventListener('click', async () => {
       const prompt = document.getElementById('iaPrompt').value;

      try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'devstral-small-2505',
            messages: [
              { role: 'user', content:    
                
                `Voici un exemple de tache que j'intègre dans mon site web:
                [
                    {
                        "id": "e369f1c2-aee5-4743-b997-45395ced31f1",
                        "titre": "Titre de la tâche",
                        "description": "Description de la tâche",
                        "charge": 3, // Nombre entre 1 et 5 selon la difficulté de la tache
                        "statut": "à faire" // à faire ou fait
                    }
                ]
                
                génére moi les tâches en suivant le code exemple, pour ce projet: ${prompt}
                
                Génère uniquement un tableau JSON **conforme** à cet exemple, sans indentation, sans texte autour, sans 'json', sans commentaires :
                ` }
            ],
            temperature: 0.7
          }),
        });

        const data = await response.json();
        let jsonText = data.choices[0].message.content.trim();
        jsonText = jsonText.replace(/\n/g, '').replace(/\r/g, '').trim();
        if (jsonText.startsWith('"') && jsonText.endsWith('"')) {
        jsonText = jsonText.slice(1, -1).replace(/\\"/g, '"');
        }
        let newTasks = JSON.parse(jsonText); // ✅ On transforme le JSON reçu en tableau
       
        try {
            const parsed = JSON.parse(jsonText);

            // Si c’est un tableau, on l’utilise tel quel
            if (Array.isArray(parsed)) {
                newTasks = parsed;
            } else {
                // Sinon on l’encapsule dans un tableau
                newTasks = [parsed];
            }

            newTasks.forEach(task => {
              createTask(task);
              
            });
            // tasks = tasks.concat(newTasks);
            saveAndRender();

        } catch (e) {
        console.error("❌ Erreur lors du JSON.parse : ", e);
        // console.log("🔍 Contenu reçu (potentiellement mal formé) :", jsonText);
        }
      } catch (err) {
        // console.log('Erreur : ' + err.message);
      }
    });



// Initial rendering
renderTasks();
