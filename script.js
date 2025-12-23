document.addEventListener('DOMContentLoaded', () => {

let people = [];
let records = [];

const personSelect = document.getElementById('person');
const newPersonInput = document.getElementById('newPerson');
const addPersonBtn = document.getElementById('addPersonBtn');
const dateInput = document.getElementById('date');

const openTasksBtn = document.getElementById('openTasks');
const tasksModal = document.getElementById('tasksModal');
const tasksCheckboxesDiv = document.getElementById('tasksCheckboxes');
const saveTasksBtn = document.getElementById('saveTasks');
const selectedTasksDiv = document.getElementById('selectedTasks');

const hoursInput = document.getElementById('hours');
const commentInput = document.getElementById('comment');
const addRecordBtn = document.getElementById('addRecordBtn');

const selectedPersonDiv = document.getElementById('selectedPerson');
const recordsCards = document.getElementById('recordsCards');
const totalHoursList = document.getElementById('totalHours');
const exportBtn = document.getElementById('exportBtn');

const taskList = [
  "Vybrat kontejnery","Manipulace kontejneru","Demontáž a montáž panely",
  "Demontáž a montáž příček","Výměna vaty(panely)","Výměna vaty(rohy kontejnerů, sloupy kontejnerů)",
  "Repasovani panelu","(Trapézové plechy, lamino, lišty)","Demontáž a montáž oken",
  "Demontáž a montáž líná (lepení, trhání, svařování)","Lepení samolepek","Montáž/Demontáž zárubně",
  "Montáž/Demontáž dveře","Montáž/Demontáž stropních lamino","Elektroinstalace",
  "Vodní instalace","Úklid","Montáž na akce"
];

let selectedTasks = [];

// --- Рендер задач в модалке ---
function renderTasksModal() {
  tasksCheckboxesDiv.innerHTML = '';
  taskList.forEach(task => {
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = task;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(task));
    tasksCheckboxesDiv.appendChild(label);
  });
}

// --- Обновление select и отображение выбранного человека ---
function updatePersonSelect(){
  personSelect.innerHTML='';
  people.forEach(p=>{
    const opt=document.createElement('option');
    opt.value=p;
    opt.textContent=p;
    personSelect.appendChild(opt);
  });
  updateSelectedPerson();
}

function updateSelectedPerson(){
  selectedPersonDiv.innerHTML = `Vybraná osoba: <span>${personSelect.value || 'nikdo'}</span>`;
}

// --- Добавление человека ---
addPersonBtn.addEventListener('click',()=>{
  const name = newPersonInput.value.trim();
  if(name && !people.includes(name)){
    people.push(name);
    updatePersonSelect();
    newPersonInput.value='';
  }
});

personSelect.addEventListener('change',updateSelectedPerson);

// --- Модальное окно выбора работы ---
openTasksBtn.addEventListener('click',()=>{
  renderTasksModal();
  tasksModal.classList.remove('hidden');
});

saveTasksBtn.addEventListener('click',()=>{
  selectedTasks = Array.from(tasksCheckboxesDiv.querySelectorAll('input:checked')).map(cb=>cb.value);
  selectedTasksDiv.textContent = selectedTasks.length>0 ? selectedTasks.join(', ') : 'Žádná práce vybrána';
  tasksModal.classList.add('hidden');
});

// --- Добавление записи ---
addRecordBtn.addEventListener('click',()=>{
  const person = personSelect.value;
  const date = dateInput.value;
  const hours = parseFloat(hoursInput.value);
  const comment = commentInput.value;

  if(!person || !date || selectedTasks.length===0 || isNaN(hours)){
    alert('Vyplňte všechna pole!');
    return;
  }

  records.push({person,date,tasks:[...selectedTasks],hours,comment});
  renderRecords();
});

// --- Рендер карточек ---
function renderRecords(){
  recordsCards.innerHTML='';
  records.forEach((r,i)=>{
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML=`
      <div class="delete-btn" data-index="${i}">x</div>
      <h4>${r.person}</h4>
      <p><strong>Datum:</strong> ${r.date}</p>
      <div class="tasks"><strong>Práce:</strong> ${r.tasks.map(t=>`<span>${t}</span>`).join('')}</div>
      <p><strong>Hodiny:</strong> ${r.hours}</p>
      <p><strong>Komentář:</strong> ${r.comment}</p>
    `;
    recordsCards.appendChild(card);
  });

  document.querySelectorAll('.delete-btn').forEach(btn=>{
    btn.onclick=()=>{
      const i=parseInt(btn.dataset.index);
      records.splice(i,1);
      renderRecords();
    };
  });

  updateTotalHours();
}

function updateTotalHours(){
  const totals={};
  records.forEach(r=>totals[r.person]=(totals[r.person]||0)+r.hours);
  totalHoursList.innerHTML='';
  for(let p in totals){
    const li=document.createElement('li');
    li.textContent=`${p}: ${totals[p]} hodiny celkem`;
    totalHoursList.appendChild(li);
  }
}

// --- Экспорт ---
exportBtn.addEventListener('click',()=>{
  if(records.length===0){ alert('Žádné záznamy k exportu!'); return;}
  const ws_data=[['Osoba','Datum','Práce','Hodiny','Komentář']];
  records.forEach(r=>ws_data.push([r.person,r.date,r.tasks.join('; '),r.hours,r.comment]));
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb,ws,'Záznamy');
  XLSX.writeFile(wb,'records.xlsx');
});

}); // DOMContentLoaded end
