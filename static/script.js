// Met à jour le label du champ selon le type de relation choisi
const radios = document.querySelectorAll('input[name="relationType"]');
const relatedTaskLabel = document.getElementById("relatedTaskLabel");
const relatedTaskInput = document.getElementById("relatedTask");

radios.forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.value === "predecesseur") {
      relatedTaskLabel.textContent = "Tâche prédécesseur";
      relatedTaskInput.placeholder = "Nom de la tâche prédécesseur (optionnel)";
    } else {
      relatedTaskLabel.textContent = "Tâche successeur";
      relatedTaskInput.placeholder = "Nom de la tâche successeur (optionnel)";
    }
  });
});

// Soumission du formulaire (à compléter selon la logique métier)
document.getElementById("taskForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const task = {
    name: document.getElementById("taskName").value.trim(),
    duration: parseInt(document.getElementById("taskDuration").value),
    relationType: document.querySelector('input[name="relationType"]:checked').value,
    relatedTask: document.getElementById("relatedTask").value.trim()
  };

  console.log("Tâche ajoutée :", task);
  // Prochaine étape : envoyer `task` vers Flask ou l'ajouter au tableau dynamique
});