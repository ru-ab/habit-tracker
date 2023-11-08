"use strict";

const HABBIT_KEY = "HABBIT_KEY";
let habbits = [];
let globalActiveHabbitId;

/* page */
const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector("h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  main: {
    days: document.querySelector(".days"),
    habbitDayAdd: document.querySelector(".habbit__day-add"),
  },
  popup: {
    index: document.getElementById("add-habit-popup"),
    iconField: document.querySelector(".popup__form input[name='icon']"),
  },
};

/* utils */
function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitsString);

  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

/* render */
function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      const element = document.createElement("button");
      element.addEventListener("click", () => rerender(habbit.id));
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");
      element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}" />`;
      if (habbit.id === activeHabbit.id) {
        element.classList.add("menu__item_active");
      }
      page.menu.appendChild(element);
      continue;
    }

    if (habbit.id === activeHabbit.id) {
      existed.classList.add("menu__item_active");
    } else {
      existed.classList.remove("menu__item_active");
    }
  }
}

function rerenderHeader(activeHabbit) {
  page.header.h1.innerText = activeHabbit.name;

  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;

  page.header.progressPercent.innerText = `${progress.toFixed(0)}%`;
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderBody(activeHabbit) {
  page.main.days.innerHTML = "";
  for (const [i, day] of activeHabbit.days.entries()) {
    const divHabbit = document.createElement("div");
    divHabbit.classList.add("habbit");

    const divHabbitDay = document.createElement("div");
    divHabbitDay.classList.add("habbit__day");
    divHabbitDay.innerText = `День ${i + 1}`;
    divHabbit.appendChild(divHabbitDay);

    const divHabbitComment = document.createElement("div");
    divHabbitComment.classList.add("habbit__comment");
    divHabbitComment.innerText = day.comment;
    divHabbit.appendChild(divHabbitComment);

    const deleteButton = document.createElement("button");
    deleteButton.addEventListener("click", () => deleteDay(i));
    deleteButton.classList.add("habbit__delete");
    deleteButton.innerHTML = `<img src="images/delete.svg" alt="Удалить день ${
      i + 1
    }" />`;
    divHabbit.appendChild(deleteButton);

    page.main.days.appendChild(divHabbit);
  }

  page.main.habbitDayAdd.innerText = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId;
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
  if (!activeHabbit) {
    return;
  }

  document.location.replace(document.location.pathname + "#" + activeHabbitId);

  rerenderMenu(activeHabbit);
  rerenderHeader(activeHabbit);
  rerenderBody(activeHabbit);
}

/* work with days */
function addDays(event) {
  event.preventDefault();
  const form = event.target;
  const formValues = validateForm(form, ["comment"]);
  if (!formValues) {
    return;
  }

  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: formValues.comment }]),
      };
    }
    return habbit;
  });
  resetForm(form, ["comment"]);
  rerender(globalActiveHabbitId);
  saveData();
}

function deleteDay(index) {
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days = habbit.days.filter((day, i) => i !== index);
    }
    return habbit;
  });

  rerender(globalActiveHabbitId);
  saveData();
}

/* work with popup */
function togglePopup() {
  if (page.popup.index.classList.contains("cover_hidden")) {
    page.popup.index.classList.remove("cover_hidden");
  } else {
    page.popup.index.classList.add("cover_hidden");
  }
}

/* working with habits */
function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector(".icon.icon_active");
  activeIcon.classList.remove("icon_active");
  context.classList.add("icon_active");
}

function addHabit(event) {
  event.preventDefault();
  const form = event.target;
  const formValues = validateForm(form, ["icon", "name", "target"]);
  if (!formValues) {
    return;
  }

  const maxId = habbits.reduce(
    (acc, habbit) => (habbit.id > acc ? habbit.id : acc),
    0
  );
  habbits.push({
    id: maxId + 1,
    icon: formValues.icon,
    name: formValues.name,
    target: formValues.target,
    days: [],
  });

  saveData();
  rerender(globalActiveHabbitId);
  togglePopup();
  resetForm(form, ["name", "target"]);
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = "";
  }
}

function validateForm(form, fields) {
  const data = new FormData(form);

  const res = {};
  for (const field of fields) {
    const value = data.get(field);
    form[field].classList.remove("error");
    if (!value) {
      form[field].classList.add("error");
    }
    res[field] = value;
  }

  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
      break;
    }
  }

  if (!isValid) {
    return;
  }

  return res;
}

/* init */
(() => {
  loadData();

  const hashId = Number(document.location.hash.replace("#", ""));
  const habbit = habbits.find((habbit) => habbit.id === hashId);
  if (habbit) {
    rerender(habbit.id);
  } else {
    rerender(habbits[0].id);
  }
})();
