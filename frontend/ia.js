
const API_URL = 'https://api.mistral.ai/v1/chat/completions';
const API_KEY = 'fWurjXt4w5Zte3bn1kuOfibKqIWzLsw2';  // Remplace par ta vraie clé API

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
                <div class="task charge-3">
                    <span class="tag jaune">🧠 modéré</span>
                    <h3>Faire le front-end</h3>
                    <p>Réaliser le design de l'application en html css</p>
                    <button onclick="editTask('fd16d03b-9492-4cff-b153-ab46cf9855bd')">✏️ Modifier</button>
                    <button onclick="deleteTask('fd16d03b-9492-4cff-b153-ab46cf9855bd')">❌ Supprimer</button>
                </div>
                
                génére moi les tâches en suivant le code exemple, pour ce projet: ${prompt}
                
                Ecrit juste le CODE, pas d'intoduction, pas de conclusion, pas de titres juste le CODE
                ` }
            ],
            temperature: 0.7
          }),
        });

        const data = await response.json();
        console.log(data.choices[0].message.content);
        document.getElementById('taskList').appendChild()
      } catch (err) {
        console.log('Erreur : ' + err.message);
      }
    });


