let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let taskEditingId = null; // 🔁 Si on édite une tâche

const API_URL = 'https://api.mistral.ai/v1/chat/completions';
const API_KEY = 'fWurjXt4w5Zte3bn1kuOfibKqIWzLsw2';  // Remplace par ta vraie clé API


document.getElementById("taskForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value;
  const desc = document.getElementById("taskDesc").value;
  const charge = parseInt(document.getElementById("charge").value);

  if (taskEditingId) {
    // Mode édition
    const task = tasks.find(t => t.id === taskEditingId);
    task.title = title;
    task.desc = desc;
    task.charge = charge;
    taskEditingId = null;
    this.querySelector("button[type='submit']").textContent = "Ajouter tâche";
  } else {
    // Nouvelle tâche
    const task = {
      id: crypto.randomUUID(),
      title,
      desc,
      charge,
      status: "à faire"
    };
    tasks.push(task);
  }

  saveAndRender();
  this.reset();
});


function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  // console.log("Type de tasks :", typeof tasks, tasks);
  // console.log("Est un tableau :", Array.isArray(tasks));

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = `task charge-${task.charge}`;
    div.innerHTML = `
    ${getChargeTag(task.charge)}
    <h3>${task.title}</h3>
    <p>${task.desc}</p>
    <button onclick="editTask('${task.id}')">✏️ Modifier</button>
    <button onclick="deleteTask('${task.id}')">❌ Supprimer</button>
    `;

    list.appendChild(div);
  });
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveAndRender();
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
function startVoiceInput() {
  const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.onresult = function (event) {
    const text = event.results[0][0].transcript;
    document.getElementById("taskTitle").value = text;
  };
  recognition.start();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDesc").value = task.desc;
  document.getElementById("charge").value = task.charge;

  taskEditingId = id;
  document.querySelector("#taskForm button[type='submit']").textContent = "Mettre à jour";
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
                        "title": "Titre de la tâche",
                        "desc": "Description de la tâche",
                        "charge": 3, // Nombre entre 1 et 5 selon la difficulté de la tache
                        "status": "à faire" // à faire ou fait
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
        // on enlève les guillemets et on remplace les échappements internes
        jsonText = jsonText.slice(1, -1).replace(/\\"/g, '"');
        }
        // console.log(jsonText);
        // document.getElementById('taskList').innerHTML += data.choices[0].message.content;
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

            tasks = tasks.concat(newTasks);
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
