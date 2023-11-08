"use strict";

const LOCAL_STORAGE_KEY = "HABIT_KEY";
let habits = [];
let globalActiveHabitId;

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
    habitDayAdd: document.querySelector(".habit__day-add"),
  },
  popup: {
    index: document.getElementById("add-habit-popup"),
    iconField: document.querySelector(".popup__form input[name='icon']"),
  },
};

/* utils */
function loadData() {
  const habitsString = localStorage.getItem(LOCAL_STORAGE_KEY);
  const habitArray = JSON.parse(habitsString);

  if (Array.isArray(habitArray)) {
    habits = habitArray;
  }
}

function saveData() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(habits));
}

/* render */
function rerenderMenu(activeHabit) {
  for (const habit of habits) {
    const existed = document.querySelector(`[menu-habit-id="${habit.id}"]`);
    if (!existed) {
      const element = document.createElement("button");
      element.addEventListener("click", () => rerender(habit.id));
      element.setAttribute("menu-habit-id", habit.id);
      element.classList.add("menu__item");
      element.innerHTML = `<img src="./images/${habit.icon}.svg" alt="${habit.name}" />`;
      if (habit.id === activeHabit.id) {
        element.classList.add("menu__item_active");
      }
      page.menu.appendChild(element);
      continue;
    }

    if (habit.id === activeHabit.id) {
      existed.classList.add("menu__item_active");
    } else {
      existed.classList.remove("menu__item_active");
    }
  }
}

function rerenderHeader(activeHabit) {
  page.header.h1.innerText = activeHabit.name;

  const progress =
    activeHabit.days.length / activeHabit.target > 1
      ? 100
      : (activeHabit.days.length / activeHabit.target) * 100;

  page.header.progressPercent.innerText = `${progress.toFixed(0)}%`;
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderBody(activeHabit) {
  page.main.days.innerHTML = "";
  for (const [i, day] of activeHabit.days.entries()) {
    const divHabit = document.createElement("div");
    divHabit.classList.add("habit");

    const divHabitDay = document.createElement("div");
    divHabitDay.classList.add("habit__day");
    divHabitDay.innerText = `Day ${i + 1}`;
    divHabit.appendChild(divHabitDay);

    const divHabitComment = document.createElement("div");
    divHabitComment.classList.add("habit__comment");
    divHabitComment.innerText = day.comment;
    divHabit.appendChild(divHabitComment);

    const deleteButton = document.createElement("button");
    deleteButton.addEventListener("click", () => deleteDay(i));
    deleteButton.classList.add("habit__delete");
    deleteButton.innerHTML = `<img src="images/delete.svg" alt="Delete day ${
      i + 1
    }" />`;
    divHabit.appendChild(deleteButton);

    page.main.days.appendChild(divHabit);
  }

  page.main.habitDayAdd.innerText = `Day ${activeHabit.days.length + 1}`;
}

function rerender(activeHabitId) {
  globalActiveHabitId = activeHabitId;
  const activeHabit = habits.find((habit) => habit.id === activeHabitId);
  if (!activeHabit) {
    return;
  }

  document.location.replace(document.location.pathname + "#" + activeHabitId);

  rerenderMenu(activeHabit);
  rerenderHeader(activeHabit);
  rerenderBody(activeHabit);
}

/* work with days */
function addDays(event) {
  event.preventDefault();
  const form = event.target;
  const formValues = validateForm(form, ["comment"]);
  if (!formValues) {
    return;
  }

  habits = habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      return {
        ...habit,
        days: habit.days.concat([{ comment: formValues.comment }]),
      };
    }
    return habit;
  });
  resetForm(form, ["comment"]);
  rerender(globalActiveHabitId);
  saveData();
}

function deleteDay(index) {
  habits = habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      habit.days = habit.days.filter((day, i) => i !== index);
    }
    return habit;
  });

  rerender(globalActiveHabitId);
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

  const maxId = habits.reduce(
    (acc, habit) => (habit.id > acc ? habit.id : acc),
    0
  );
  habits.push({
    id: maxId + 1,
    icon: formValues.icon,
    name: formValues.name,
    target: formValues.target,
    days: [],
  });

  saveData();
  rerender(globalActiveHabitId);
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
  const habit = habits.find((habit) => habit.id === hashId);
  if (habit) {
    rerender(habit.id);
  } else {
    rerender(habits[0].id);
  }
})();
