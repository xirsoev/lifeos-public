const nutritionDefaults = { calories: 2000, protein: 100, fats: 70, carbs: 250, fiber: 25, waterMl: 2000 };
const baseFoods = [
  { name: 'Куриная грудка, приготовленная', calories: 165, protein: 31, fats: 3.6, carbs: 0, fiber: 0 },
  { name: 'Яйцо куриное', calories: 143, protein: 12.6, fats: 9.5, carbs: 0.7, fiber: 0 },
  { name: 'Гречка, варёная', calories: 92, protein: 3.4, fats: 0.6, carbs: 19.9, fiber: 2.7 },
  { name: 'Рис белый, варёный', calories: 130, protein: 2.7, fats: 0.3, carbs: 28.2, fiber: 0.4 },
  { name: 'Овсяные хлопья, сухие', calories: 379, protein: 13.2, fats: 6.5, carbs: 67.7, fiber: 10.1 },
  { name: 'Лосось, приготовленный', calories: 206, protein: 22.1, fats: 12.4, carbs: 0, fiber: 0 },
  { name: 'Чечевица, варёная', calories: 116, protein: 9, fats: 0.4, carbs: 20.1, fiber: 7.9 },
  { name: 'Картофель, варёный', calories: 87, protein: 1.9, fats: 0.1, carbs: 20.1, fiber: 1.8 },
  { name: 'Йогурт натуральный', calories: 61, protein: 3.5, fats: 3.3, carbs: 4.7, fiber: 0 },
  { name: 'Творог 5%', calories: 121, protein: 17, fats: 5, carbs: 1.8, fiber: 0 },
  { name: 'Молоко 2%', calories: 50, protein: 3.3, fats: 2, carbs: 4.8, fiber: 0 },
  { name: 'Хлеб цельнозерновой', calories: 247, protein: 13, fats: 4.2, carbs: 41.2, fiber: 7 },
  { name: 'Банан', calories: 89, protein: 1.1, fats: 0.3, carbs: 22.8, fiber: 2.6 },
  { name: 'Яблоко с кожурой', calories: 52, protein: 0.3, fats: 0.2, carbs: 13.8, fiber: 2.4 },
  { name: 'Авокадо', calories: 160, protein: 2, fats: 14.7, carbs: 8.5, fiber: 6.7 },
  { name: 'Помидор', calories: 18, protein: 0.9, fats: 0.2, carbs: 3.9, fiber: 1.2 },
  { name: 'Огурец с кожурой', calories: 15, protein: 0.7, fats: 0.1, carbs: 3.6, fiber: 0.5 },
  { name: 'Брокколи, варёная', calories: 35, protein: 2.4, fats: 0.4, carbs: 7.2, fiber: 3.3 },
  { name: 'Миндаль', calories: 579, protein: 21.2, fats: 49.9, carbs: 21.6, fiber: 12.5 },
  { name: 'Масло оливковое', calories: 884, protein: 0, fats: 100, carbs: 0, fiber: 0 },
];
const macroNames = { calories: 'Калории', protein: 'Белки', fats: 'Жиры', carbs: 'Углеводы', fiber: 'Клетчатка' };

function calculateNutritionTargets(profile) {
  const age = Number(profile.age), height = Number(profile.heightCm), weight = Number(profile.weightKg);
  let maintenanceCalories;
  if (age >= 3 && age < 19) {
    // 2023 National Academies DRI EER equations for children and adolescents.
    // The activity choices in this app are mapped to the four PA categories.
    const paCategory = { low: 'inactive', light: 'lowActive', moderate: 'active', high: 'veryActive' }[profile.activity] || 'inactive';
    const boy = {
      inactive: -447.51 + 3.68 * age + 13.01 * height + 13.15 * weight,
      lowActive: 19.12 + 3.68 * age + 8.62 * height + 20.28 * weight,
      active: -388.19 + 3.68 * age + 12.66 * height + 20.46 * weight,
      veryActive: -671.75 + 3.68 * age + 15.38 * height + 23.25 * weight,
    }[paCategory] + (age < 4 ? 20 : age < 9 ? 15 : age < 14 ? 25 : 20);
    const girl = {
      inactive: 55.59 - 22.25 * age + 8.43 * height + 17.07 * weight,
      lowActive: -297.54 - 22.25 * age + 12.77 * height + 14.73 * weight,
      active: -189.55 - 22.25 * age + 11.74 * height + 18.34 * weight,
      veryActive: -709.59 - 22.25 * age + 18.22 * height + 14.25 * weight,
    }[paCategory] + (age < 14 ? (age < 4 ? 15 : age < 9 ? 15 : 30) : 20);
    maintenanceCalories = profile.sex === 'male' ? boy : profile.sex === 'female' ? girl : (boy + girl) / 2;
  } else {
    const resting = 10 * weight + 6.25 * height - 5 * age + (profile.sex === 'male' ? 5 : profile.sex === 'female' ? -161 : -78);
    const activity = { low: 1.2, light: 1.375, moderate: 1.55, high: 1.725 }[profile.activity] || 1.2;
    maintenanceCalories = resting * activity;
  }
  // Weight-loss/gain targets are not generated for users under 19.
  const goalFactor = age < 19 ? 1 : ({ maintain: 1, lose: 0.9, gain: 1.1 }[profile.goal] || 1);
  const calories = Math.min(5000, Math.max(800, Math.round(maintenanceCalories * goalFactor / 50) * 50));
  return { calories, protein: Math.round(calories * 0.2 / 4), fats: Math.round(calories * 0.3 / 9), carbs: Math.round(calories * 0.5 / 4), fiber: Math.round(calories / 1000 * 14) };
}

function nutritionCatalog() {
  return [...baseFoods.map((food, index) => ({ ...food, key: `base-${index}` })), ...(state.data.nutritionFoods || []).map(food => ({ ...food, key: `custom-${food.id}` }))];
}
function nutritionMeals(date = state.nutritionDate || today()) { return (state.data.meals || []).filter(meal => meal.date === date); }
function nutritionTotals(meals = nutritionMeals()) {
  return meals.reduce((total, meal) => {
    for (const key of Object.keys(macroNames)) total[key] += Number(meal[key]) || 0;
    return total;
  }, { calories: 0, protein: 0, fats: 0, carbs: 0, fiber: 0 });
}
function nutritionProgress(label, value, goal, unit, color = '') {
  const safeGoal = Math.max(1, Number(goal) || 0), percent = Math.min(100, value / safeGoal * 100);
  return `<div class="nutrition-progress-item"><div><span>${label}</span><strong>${Math.round(value)}${unit} <small>/ ${safeGoal}${unit}</small></strong></div><div class="progress"><i class="${color}" style="width:${percent}%"></i></div></div>`;
}
function nutritionPage() {
  state.nutritionDate ||= today();
  state.data.nutritionGoals = Object.assign({}, nutritionDefaults, state.data.nutritionGoals || {});
  const date = state.nutritionDate, meals = nutritionMeals(date), totals = nutritionTotals(meals), goals = state.data.nutritionGoals;
  const water = (state.data.waterLogs || []).filter(item => item.date === date).reduce((sum, item) => sum + (Number(item.ml) || 0), 0);
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(`${today()}T12:00:00`); d.setDate(d.getDate() - 6 + i); const day = d.toLocaleDateString('sv-SE'); return { date: day, label: d.toLocaleDateString('ru-RU', { weekday: 'short' }), value: nutritionTotals(nutritionMeals(day)).calories }; });
  const maxCalories = Math.max(Number(goals.calories) || 0, ...week.map(day => day.value), 1);
  const profile = state.data.profile.nutritionProfile || {};
  const profileSummary = profile.age ? `${profile.age} лет · ${profile.heightCm} см · ${profile.weightKg} кг · ${({ low: 'мало движения', light: 'лёгкая активность', moderate: 'средняя активность', high: 'высокая активность' })[profile.activity] || 'активность не указана'}` : 'Заполните данные для персонального расчёта';
  const analysis = state.nutritionAnalysis;
  const analysisPanel = state.nutritionAnalysisLoading ? `<section class="card nutrition-analysis section-card" aria-live="polite"><div class="nutrition-loading"><span class="nutrition-spinner"></span><div><strong>Смотрю, что на фото…</strong><p>Считаю примерную порцию и КБЖУ.</p></div></div></section>` : analysis?.error ? `<section class="card nutrition-analysis section-card"><div class="nutrition-analysis-head"><h2>Фото блюда</h2><button class="tiny-btn" data-nutrition-action="dismiss-analysis">×</button></div><p class="nutrition-error">${esc(analysis.error)}</p><button class="secondary" data-nutrition-action="retry-analysis">Попробовать ещё раз</button></section>` : analysis?.result ? `<section class="card nutrition-analysis section-card"><div class="nutrition-analysis-head"><div><p class="eyebrow">ОЦЕНКА ПО ФОТО</p><h2>${analysis.result.isFood ? 'Проверьте блюдо перед записью' : 'Не удалось распознать еду'}</h2></div><button class="tiny-btn" data-nutrition-action="dismiss-analysis">×</button></div>${analysis.result.isFood ? `<div class="nutrition-review"><img class="nutrition-preview" src="${analysis.preview}" alt="Загруженное блюдо"><div class="nutrition-review-fields"><label class="field">Название блюда<input name="reviewName" required maxlength="100" value="${esc(analysis.result.dishName)}"></label><label class="field">Примерный вес порции, г<input name="reviewGrams" type="number" min="1" max="3000" value="${analysis.result.portionGrams}"></label><div class="nutrition-review-macros">${[['reviewCalories','Калории, ккал','calories',4000],['reviewProtein','Белки, г','protein',500],['reviewFats','Жиры, г','fats',500],['reviewCarbs','Углеводы, г','carbs',700],['reviewFiber','Клетчатка, г','fiber',100]].map(([name,label,key,max])=>`<label class="field">${label}<input name="${name}" type="number" min="0" max="${max}" step="0.1" value="${analysis.result[key]}"></label>`).join('')}</div><label class="field">Приём пищи<select name="reviewType">${['Завтрак','Обед','Ужин','Перекус'].map(type=>`<option ${analysis.type===type?'selected':''}>${type}</option>`).join('')}</select></label></div></div><p class="nutrition-ingredients"><strong>Похоже на:</strong> ${analysis.result.ingredients.map(esc).join(' · ') || 'состав не удалось уверенно определить'}</p><p class="nutrition-hint">Оценка по изображению может ошибаться, особенно в весе, масле и соусах. Исправьте значения и подтвердите запись. Фото после анализа не сохраняется.</p><button class="primary" data-nutrition-action="accept-analysis">Добавить в дневник <span>→</span></button>` : `<p class="muted">Попробуйте другое фото с едой, снятой сверху при хорошем освещении.</p>`}</section>` : '';
  const aiState = state.nutritionAiConfigured ? '<span class="badge nutrition-ai-ready">Фотоанализ подключён</span>' : '<span class="badge nutrition-ai-off">Фотоанализ: нужен API-ключ</span>';
  return `${heading('Питание', 'КБЖУ, клетчатка и вода — в удобной сводке.', '<div class="heading-actions"><button class="secondary" data-nutrition-action="goals">Цели</button><button class="secondary" data-nutrition-action="add-meal">Добавить продукт</button><button class="primary" data-nutrition-action="analyze-photo">Фото блюда <span>＋</span></button></div>')}
    <div class="nutrition-note">Каталог содержит примерные значения на 100 г; сверяйтесь с упаковкой или <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">USDA FoodData Central</a>. ${Number(profile.age)>=3&&Number(profile.age)<19?'Для пользователей 3–18 лет используется формула EER с учётом активности и роста; это примерный ориентир, а не медицинское назначение.':'Персональные цели для взрослых рассчитаны по формуле Mifflin–St Jeor и активности; это примерный ориентир, а не медицинское назначение.'} <button class="link-btn" data-nutrition-action="edit-profile">Изменить параметры</button></div>
    <div class="nutrition-profile-strip"><div><strong>Мои параметры</strong><span>${esc(profileSummary)}</span></div><button class="tiny-btn" data-nutrition-action="edit-profile">Изменить</button>${aiState}</div>${analysisPanel}
    <div class="card nutrition-card"><div class="card-head"><div><h2>Сводка за день</h2><p class="nutrition-subtitle">${date === today() ? 'Сегодня' : new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div><div class="nutrition-date-controls"><button class="tiny-btn" data-nutrition-action="previous-day" aria-label="Предыдущий день">←</button><input type="date" id="nutrition-date" value="${esc(date)}" aria-label="Выбрать дату"><button class="tiny-btn" data-nutrition-action="next-day" aria-label="Следующий день">→</button><button class="tiny-btn" data-nutrition-action="today">Сегодня</button></div></div>
      <div class="nutrition-bars">${nutritionProgress('Калории', totals.calories, goals.calories, ' ккал')}${nutritionProgress('Белки', totals.protein, goals.protein, ' г', 'macro-protein')}${nutritionProgress('Жиры', totals.fats, goals.fats, ' г', 'macro-fat')}${nutritionProgress('Углеводы', totals.carbs, goals.carbs, ' г', 'macro-carbs')}</div>
      <div class="nutrition-minors"><span>Клетчатка <strong>${totals.fiber.toFixed(1)} г</strong> / ${goals.fiber} г</span><span>Записей <strong>${meals.length}</strong></span></div>
    </div>
    <div class="nutrition-layout section-card"><section class="card"><div class="card-head"><div><h2>Приёмы пищи</h2><p class="nutrition-subtitle">Фото блюда или продукт по весу</p></div><span class="badge">${meals.length}</span></div>
      ${meals.length ? ['Завтрак', 'Обед', 'Ужин', 'Перекус'].map(type => { const items = meals.filter(meal => meal.type === type); return items.length ? `<div class="meal-group"><h3>${type}</h3>${items.map(meal => `<div class="meal-row"><div class="meal-symbol">${type === 'Завтрак' ? '☀' : type === 'Обед' ? '◉' : type === 'Ужин' ? '☾' : '·'}</div><div class="meal-main"><strong>${esc(meal.name)}</strong><small>${meal.grams} г · Б ${Number(meal.protein).toFixed(1)} г · Ж ${Number(meal.fats).toFixed(1)} г · У ${Number(meal.carbs).toFixed(1)} г</small></div><div class="meal-energy"><strong>${Math.round(meal.calories)}</strong><small>ккал</small></div><button class="tiny-btn" data-nutrition-action="repeat-meal" data-id="${esc(meal.id)}" title="Добавить ещё раз">↻</button><button class="tiny-btn" data-nutrition-action="delete-meal" data-id="${esc(meal.id)}" title="Удалить">×</button></div>`).join('')}</div>` : ''; }).join('') : '<div class="empty"><span>♨</span>Пока нет записей за этот день. Добавьте первый продукт.</div>'}
    </section><aside class="card hydration-card"><div class="card-head"><div><h2>Вода</h2><p class="nutrition-subtitle">Отмечайте выпитые стаканы</p></div><span class="stat-icon">◌</span></div><div class="water-total">${(water / 1000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}<small> л</small></div><div class="nutrition-progress-item"><div><span>Дневной ориентир</span><strong>${Math.round(water)} <small>/ ${goals.waterMl} мл</small></strong></div><div class="progress"><i class="water-progress" style="width:${Math.min(100, water / Math.max(1, goals.waterMl) * 100)}%"></i></div></div><div class="water-buttons"><button class="secondary" data-nutrition-action="water-250">＋ 250 мл</button><button class="secondary" data-nutrition-action="water-500">＋ 500 мл</button></div><button class="link-btn" data-nutrition-action="water-undo">Отменить последнюю отметку</button><p class="nutrition-hint">Потребность в воде индивидуальна; ориентир можно изменить.</p></aside></div>
    <section class="card section-card"><div class="card-head"><div><h2>Калории за 7 дней</h2><p class="nutrition-subtitle">Сводка по записям в дневнике</p></div><span class="stat-icon">↗</span></div><div class="nutrition-week">${week.map(day => `<div class="nutrition-day"><div class="nutrition-day-value">${day.value ? Math.round(day.value) : '–'}</div><div class="nutrition-day-bar"><i style="height:${day.value ? Math.max(5, day.value / maxCalories * 100) : 3}%"></i></div><small>${day.label}</small></div>`).join('')}</div></section>
    <section class="card section-card"><div class="card-head"><div><h2>Мои продукты</h2><p class="nutrition-subtitle">Добавьте состав продукта с упаковки, чтобы использовать его в дневнике</p></div><button class="secondary" data-nutrition-action="add-food">＋ Свой продукт</button></div><div class="food-chips">${(state.data.nutritionFoods || []).map(food => `<span class="food-chip">${esc(food.name)} · ${Math.round(food.calories)} ккал/100 г <button data-nutrition-action="delete-food" data-id="${esc(food.id)}" aria-label="Удалить ${esc(food.name)}">×</button></span>`).join('') || '<p class="nutrition-hint">Сохранённых продуктов пока нет.</p>'}</div></section>`;
}

function nutritionMealModal() {
  const options = nutritionCatalog().map(food => `<option value="${esc(food.key)}">${esc(food.name)} — ${Math.round(food.calories)} ккал / 100 г</option>`).join('');
  openModal({ title: 'Добавить продукт', fields: `<label class="field">Приём пищи<select name="type"><option>Завтрак</option><option selected>Обед</option><option>Ужин</option><option>Перекус</option></select></label><label class="field">Продукт<select name="food" required>${options}</select></label><label class="field">Вес порции, г<input name="grams" type="number" required min="1" max="5000" step="1" value="100"></label><p class="nutrition-hint">КБЖУ рассчитаются автоматически по весу порции. Для сложного блюда добавьте каждый ингредиент отдельно.</p>`, onSave: form => {
    const values = new FormData(form), food = nutritionCatalog().find(item => item.key === values.get('food')), grams = Number(values.get('grams'));
    if (!food || !Number.isFinite(grams) || grams <= 0) return;
    const scale = grams / 100, date = state.nutritionDate || today();
    state.data.meals.push({ id: id(), date, type: String(values.get('type')), name: food.name, grams, calories: food.calories * scale, protein: food.protein * scale, fats: food.fats * scale, carbs: food.carbs * scale, fiber: food.fiber * scale });
    persist('Продукт добавлен в дневник.');
  } });
}
function nutritionPhotoModal() {
  const configuredNote = state.nutritionAiConfigured ? 'Выбранное фото будет отправлено в Google Gemini для оценки блюда.' : 'Фотоанализ заработает после настройки GEMINI_API_KEY в файле .env и перезапуска сервера.';
  openModal({ title: 'Оценить блюдо по фото', fields: `<label class="field">Приём пищи<select name="type"><option>Завтрак</option><option selected>Обед</option><option>Ужин</option><option>Перекус</option></select></label><label class="field nutrition-file-field">Фото блюда<input id="nutrition-photo-file" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required><small>JPG, PNG или WebP. Фото сожмётся перед отправкой.</small></label><div id="nutrition-photo-preview" class="nutrition-upload-preview">Предпросмотр появится после выбора фото.</div><label class="nutrition-consent"><input name="photoConsent" type="checkbox" required><span>${configuredNote} На бесплатном тарифе Google может использовать данные запросов для улучшения сервисов. <a href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noopener noreferrer">Условия Gemini API</a>. Не загружайте фото людей, документов и личных данных.</span></label>`, saveLabel: 'Распознать блюдо →', onSave: form => { const values = new FormData(form), file = values.get('photo'); if (!(file instanceof File) || !file.size) return; runNutritionPhotoAnalysis(file, String(values.get('type'))); } });
}
async function compressNutritionPhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Выберите фото в формате JPG, PNG или WebP.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Фото слишком большое. Выберите файл меньше 15 МБ.');
  const bitmap = await createImageBitmap(file), scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  const toBlob = quality => new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  let blob = await toBlob(0.8); if (!blob) throw new Error('Не удалось подготовить фото. Попробуйте другое изображение.');
  if (blob.size > 1.2 * 1024 * 1024) blob = await toBlob(0.62);
  if (!blob || blob.size > 1.45 * 1024 * 1024) throw new Error('Фото не удалось сжать до нужного размера. Выберите другое изображение.');
  const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Не удалось прочитать фото.')); reader.readAsDataURL(blob); });
  return { dataUrl, data: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
}
async function runNutritionPhotoAnalysis(file, type, preview) {
  state.nutritionAnalysis = null; state.nutritionAnalysisLoading = true; render();
  try {
    if (!state.nutritionAiConfigured) throw new Error('Фотоанализ пока выключен. Добавьте Gemini API-ключ по инструкции в README.md и перезапустите приложение.');
    const image = await compressNutritionPhoto(file);
    state.nutritionAnalysis = { preview: image.dataUrl, type, sourceFile: file };
    const result = await api('/nutrition/analyze-meal', { method: 'POST', body: JSON.stringify({ image: { mimeType: image.mimeType, data: image.data } }) });
    state.nutritionAnalysis.result = result;
  } catch (error) { state.nutritionAnalysis = { ...(state.nutritionAnalysis || {}), preview: preview || state.nutritionAnalysis?.preview, type, sourceFile: file, error: error.message || 'Не удалось разобрать фото.' }; }
  finally { state.nutritionAnalysisLoading = false; render(); }
}
function nutritionGoalsModal() {
  const goals = Object.assign({}, nutritionDefaults, state.data.nutritionGoals || {});
  const fields = [['calories', 'Калории, ккал', 5000], ['protein', 'Белки, г', 500], ['fats', 'Жиры, г', 500], ['carbs', 'Углеводы, г', 1000], ['fiber', 'Клетчатка, г', 150], ['waterMl', 'Вода, мл', 10000]].map(([key, label, max]) => `<label class="field">${label}<input name="${key}" type="number" min="1" max="${max}" step="1" required value="${esc(goals[key])}"></label>`).join('');
  openModal({ title: 'Мои дневные ориентиры', fields: `<div class="nutrition-goal-fields">${fields}</div><p class="nutrition-hint">Это ваши личные ориентиры, а не медицинское назначение. При необходимости обсудите питание со специалистом.</p>`, onSave: form => { const values = Object.fromEntries(new FormData(form)); state.data.nutritionGoals = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)])); persist('Ориентиры обновлены.'); } });
}
function nutritionFoodModal() {
  openModal({ title: 'Сохранить свой продукт', fields: `<p class="nutrition-hint">Перенесите значения с упаковки на 100 г (или пересчитайте значения порции на 100 г).</p><label class="field">Название<input name="name" required maxlength="80" placeholder="Например, йогурт натуральный"></label><div class="nutrition-goal-fields"><label class="field">Калории, ккал<input name="calories" type="number" required min="0" max="1000" step="0.1"></label><label class="field">Белки, г<input name="protein" type="number" required min="0" max="100" step="0.1"></label><label class="field">Жиры, г<input name="fats" type="number" required min="0" max="100" step="0.1"></label><label class="field">Углеводы, г<input name="carbs" type="number" required min="0" max="100" step="0.1"></label><label class="field">Клетчатка, г<input name="fiber" type="number" required min="0" max="100" step="0.1" value="0"></label></div>`, onSave: form => { const values = Object.fromEntries(new FormData(form)); const food = { id: id(), name: String(values.name).trim(), calories: Number(values.calories), protein: Number(values.protein), fats: Number(values.fats), carbs: Number(values.carbs), fiber: Number(values.fiber) }; if (Object.values(food).slice(2).some(value => !Number.isFinite(value) || value < 0)) return; state.data.nutritionFoods.push(food); persist('Продукт сохранён в вашем каталоге.'); } });
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-nutrition-action]');
  if (!button) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const action = button.dataset.nutritionAction;
  if (action === 'add-meal') nutritionMealModal();
  else if (action === 'analyze-photo') nutritionPhotoModal();
  else if (action === 'add-food') nutritionFoodModal();
  else if (action === 'goals') nutritionGoalsModal();
  else if (action === 'edit-profile') showOnboarding();
  else if (action === 'dismiss-analysis') { state.nutritionAnalysis = null; state.nutritionAnalysisLoading = false; render(); }
  else if (action === 'retry-analysis') { const previous = state.nutritionAnalysis; if (previous?.sourceFile) runNutritionPhotoAnalysis(previous.sourceFile, previous.type, previous.preview); else nutritionPhotoModal(); }
  else if (action === 'accept-analysis') {
    const analysis = state.nutritionAnalysis?.result, review = $('#page');
    if (!analysis?.isFood) return;
    const fields = ['reviewName', 'reviewGrams', 'reviewCalories', 'reviewProtein', 'reviewFats', 'reviewCarbs', 'reviewFiber'];
    if (fields.some(name => !review.querySelector(`[name="${name}"]`)?.reportValidity())) return;
    const value = name => review.querySelector(`[name="${name}"]`).value;
    state.data.meals.push({ id: id(), date: state.nutritionDate || today(), type: value('reviewType'), name: value('reviewName').trim(), grams: Number(value('reviewGrams')), calories: Number(value('reviewCalories')), protein: Number(value('reviewProtein')), fats: Number(value('reviewFats')), carbs: Number(value('reviewCarbs')), fiber: Number(value('reviewFiber')), source: 'photo-estimate', ingredients: analysis.ingredients });
    state.nutritionAnalysis = null; persist('Оценка блюда добавлена в дневник.');
  }
  else if (action === 'previous-day' || action === 'next-day') { const date = new Date(`${state.nutritionDate || today()}T12:00:00`); date.setDate(date.getDate() + (action === 'next-day' ? 1 : -1)); state.nutritionDate = date.toLocaleDateString('sv-SE'); render(); }
  else if (action === 'today') { state.nutritionDate = today(); render(); }
  else if (action === 'water-250' || action === 'water-500') { state.data.waterLogs.push({ id: id(), date: state.nutritionDate || today(), ml: action === 'water-250' ? 250 : 500 }); persist('Отметка о воде сохранена.'); }
  else if (action === 'water-undo') { const index = state.data.waterLogs.findLastIndex(item => item.date === (state.nutritionDate || today())); if (index < 0) toast('Сегодня ещё нет отметок о воде.'); else { state.data.waterLogs.splice(index, 1); persist('Последняя отметка отменена.'); } }
  else if (action === 'repeat-meal') { const meal = state.data.meals.find(item => item.id === button.dataset.id); if (meal) { state.data.meals.push({ ...meal, id: id(), date: today() }); state.nutritionDate = today(); persist('Продукт добавлен ещё раз.'); } }
  else if (action === 'delete-meal') { state.data.meals = state.data.meals.filter(item => item.id !== button.dataset.id); persist('Запись удалена.'); }
  else if (action === 'delete-food') { state.data.nutritionFoods = state.data.nutritionFoods.filter(item => item.id !== button.dataset.id); persist('Продукт удалён из каталога.'); }
});
document.addEventListener('change', event => {
  if (event.target.id === 'nutrition-date') { state.nutritionDate = event.target.value || today(); render(); }
  if (event.target.id === 'nutrition-photo-file') {
    const file = event.target.files?.[0], preview = $('#nutrition-photo-preview');
    if (!preview) return;
    preview.innerHTML = file ? `<img src="${URL.createObjectURL(file)}" alt="Предпросмотр блюда">` : 'Предпросмотр появится после выбора фото.';
  }
});
