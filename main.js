
fetch('/data.json')
  .then(res => res.json())
  .then(data => {
    if (data && data.length > 0) {
      create(data);
    } else {
      console.error("Błąd: Dane z pliku data.json są puste lub niepoprawne.");
    }
  })
  .catch(err => console.error("Nie udało się wczytać pliku data.json:", err));

function create(data) {
  const f3Chart = f3.createChart('#FamilyChart', data)
    .setTransitionTime(2000)
    .setCardXSpacing(250)
    .setCardYSpacing(150)
  .setOrientationHorizontal();
  const f3Card = f3Chart.setCardHtml()
    .setCardDisplay([["first name", "last name"], ["maiden"]])
    .setStyle('imageCircle')
    .setCardDim({ h: 70 });

  const f3EditTree = f3Chart.editTree()
    .fixed(true)
    .setFields(["first name", "last name", "avatar", "maiden", "birth year", "death year", "gender", "occupation", "location", "education", "nationality", "birth place", "death place", "marriage date", "email", "phone", "address", "notes"])
    .setEditFirst(true)
    .setCardClickOpen(f3Card);

  f3EditTree.setNoEdit();

  f3Chart.updateMainId('0');
  f3Chart.updateTree({ initial: true });

  function updateTreeWithNewMainPerson(person_id, animation_initial = true) {
    f3Chart.updateMainId(person_id);
    f3Chart.updateTree({ initial: animation_initial });
  }

// random person
  d3.select(document.querySelector("#FamilyChart"))
    .append("button")
    .attr("class", "random-person-button")
    .html(`
      <svg viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-3.95 2.6-7.29 6.2-7.99L11 4v3.08l1-.77 1 .77V4l.8.01C17.41 4.71 20 8.05 20 12c0 4.08-3.05 7.44-7 7.93v-2.07l-1 1zm5.29-9.71l-2.58 2.58-1.41-1.41L13.71 8.8 12 7.09V16h2V7.09l1.29 1.29 2.59-2.58z"/>
      </svg>
    `)
    .attr("title", "Losowa osoba") // Add a tooltip for accessibility
    .on("click", () => {
      const random_person = data[Math.floor(Math.random() * data.length)];
      const person_id = random_person["id"];
      updateTreeWithNewMainPerson(person_id, false);
    });
  // setup search dropdown
  const all_select_options = [];
  data.forEach(d => {
    const label = d.data["label"] || `${d.data["first name"] || ''} ${d.data["last name"] || ''}`;
    if (label && !all_select_options.find(d0 => d0.value === d["id"])) {
      all_select_options.push({ label: label.trim(), value: d["id"] });
    }
  });

  const search_cont = d3.select(document.querySelector("#FamilyChart"))
    .append("div")
    .attr("class", "search-container")
    .on("focusout", () => {
      setTimeout(() => {
        if (!search_cont.node().contains(document.activeElement)) {
          updateDropdown([]);
        }
      }, 200);
    });

  const search_input = search_cont.append("input")
    .attr("class", "search-input")
    .attr("type", "text")
    .attr("placeholder", "Search")
    .on("focus", activateDropdown)
    .on("input", activateDropdown);

  const dropdown = search_cont.append("div")
    .attr("class", "search-dropdown");

  function activateDropdown() {
    const search_input_value = search_input.property("value");
    const filtered_options = all_select_options.filter(d => d.label.toLowerCase().includes(search_input_value.toLowerCase()));
    updateDropdown(filtered_options);
  }

  function updateDropdown(filtered_options) {
    dropdown.selectAll("div").data(filtered_options).join("div")
      .attr("class", "search-dropdown-item")
      .on("click", (e, d) => {
        updateTreeWithNewMainPerson(d.value, true);
        dropdown.selectAll("div").remove();
      })
      .text(d => d.label);
  }
}