// ============================================================
// save.js - Save/Load system using LocalStorage
// ============================================================

window.SaveSystem = (() => {
  const SAVE_KEY = 'monster_party_rpg_save';

  function save(state) {
    try {
      const data = JSON.stringify(state);
      localStorage.setItem(SAVE_KEY, data);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  function load() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  return { save, load, deleteSave, hasSave };
})();
