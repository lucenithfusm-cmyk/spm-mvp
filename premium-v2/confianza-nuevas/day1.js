(() => {
  'use strict';
  const aspects = [
    ['confidence', 'Confianza sexual', 956],
    ['satisfaction', 'Satisfacción sexual', 1034],
    ['desire', 'Deseo sexual', 1114],
    ['performanceAnxiety', 'Ansiedad de desempeño', 1203]
  ];
  const columns = [320, 404, 492, 581, 677, 777];
  const levels = ['0 · Ausencia', '1 · Bajo', '2 · Aceptable', '3 · Satisfactorio', '4 · Sin dificultades', 'No evaluable / No aplica'];
  const habits = [
    ['produce', 'Comiste verduras o frutas'],
    ['sugaryDrinks', 'Tomaste bebidas azucaradas'],
    ['processed', 'Comiste alimentos ultraprocesados'],
    ['alcohol', 'Tomaste alcohol'],
    ['regularMeals', 'Mantuviste horarios regulares de comida']
  ];
  function element(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function position(node, x, y, width, height) {
    Object.assign(node.style, {
      left: x / 864 * 100 + '%', top: y / 1536 * 100 + '%',
      width: width / 864 * 100 + '%', height: height / 1536 * 100 + '%'
    });
  }
  function open({host, prior = {}, save, exit}) {
    const lesson = window.SPM_MODULES.days.find(item => item.d === 1);
    const answers = structuredClone(prior.answers || {});
    const scores = answers.scores || {};
    const modal = element('dialog'), stage = element('section'), tools = element('div');
    const sheet = element('dialog'), notice = element('p');
    modal.className = 'conf-baseline'; stage.className = 'conf-baseline-art';
    sheet.className = 'conf-baseline-sheet'; tools.className = 'conf-baseline-tools';
    modal.setAttribute('aria-label', 'Día 1 · ' + lesson.title_es);
    stage.setAttribute('aria-label', 'Evaluación inicial de las últimas dos semanas');
    sheet.setAttribute('aria-label', 'Detalle de la actividad');
    notice.setAttribute('role','alert'); notice.className = 'conf-baseline-notice';
    modal.append(tools, stage, sheet); host.append(modal);
    let saving = false;
    function dismiss() {
      window.SPM_PRACTICE_AUDIO.stop(modal); modal.remove();
    }
    function leave() {
      if (!saving) { dismiss(); exit(); }
    }
    function button(parent, label, click) {
      const node = element('button', label);
      node.type = 'button'; node.onclick = click; parent.append(node); return node;
    }
    function hotspot(label, click, rectangle) {
      const node = button(stage, label, click);
      node.className = 'conf-baseline-hit'; position(node, ...rectangle); return node;
    }
    function panel(title) {
      window.SPM_PRACTICE_AUDIO.stop(modal);
      sheet.replaceChildren(element('h2',title)); sheet.setAttribute('aria-label',title); sheet.showModal();
    }
    button(tools,'‹ Volver',leave);
    button(tools,'Leer guía',() => {
      panel('Guía del día 1'); sheet.append(element('p',lesson.practice_es));
      button(sheet,'Volver a la evaluación',() => sheet.close());
    });
    const guide = hotspot('Escuchar guía',null,[50,482,411,84]);
    guide.dataset.spmSpeak = lesson.practice_es; guide.dataset.audioLabel = 'Escuchar guía';
    guide.setAttribute('aria-label','Escuchar guía'); guide.classList.add('conf-baseline-guide');
    modal.oncancel = event => { event.preventDefault(); leave(); };
    sheet.oncancel = event => { event.preventDefault(); event.stopPropagation(); sheet.close(); };

    for (const [key, label, y] of aspects) {
      const group = element('div');
      group.setAttribute('role','radiogroup'); group.setAttribute('aria-label',label); stage.append(group);
      columns.forEach((x, index) => {
        const value = index === 5 ? null : index, radio = element('input');
        radio.type = 'radio'; radio.name = 'conf-d1-' + key; radio.value = value === null ? 'na' : String(value);
        radio.className = 'conf-baseline-radio'; radio.setAttribute('aria-label',label + ' · ' + levels[index]);
        radio.checked = scores[key] === value;
        position(radio,x-40,y-38,80,76);
        radio.onchange = () => { scores[key] = value; notice.textContent = ''; };
        group.append(radio);
      });
    }
    hotspot('Registro breve de hábitos',() => {
      panel('Registro breve de hábitos');
      sheet.append(element('p','En las últimas dos semanas, ¿cuántos días hiciste cada cosa? Puedes dejar en blanco lo que prefieras.'));
      const form = element('form');
      for (const [key, label] of habits) {
        const field = element('label',label), select = element('select');
        select.name = key; select.add(new Option('Sin registrar',''));
        for (let days = 0; days <= 14; days++) select.add(new Option(days === 1 ? '1 día' : days+' días',String(days)));
        select.add(new Option('No lo recuerdo','unknown'));
        select.value = String(answers.habits?.[key] ?? ''); field.append(select); form.append(field);
      }
      if (prior.reflection || prior.measure) {
        const previous = element('details'); previous.append(element('summary','Ver mi registro anterior'));
        for (const text of [prior.reflection, prior.measure]) if (text) previous.append(element('p',text));
        form.append(previous);
      }
      button(form,'Cancelar',() => sheet.close());
      const apply = element('button','Guardar y volver'); apply.type = 'submit'; form.append(apply);
      form.onsubmit = event => {
        event.preventDefault();
        answers.habits = Object.fromEntries([...new FormData(form)].filter(([,v])=>v !== '').map(([key,v])=>[key,v === 'unknown' ? v : Number(v)]));
        sheet.close();
      };
      sheet.append(form);
    },[104,1278,650,84]);
    hotspot('Guardar y finalizar',async () => {
      if (saving) return;
      const missing = aspects.find(([key]) => !(scores[key] === null || Number.isInteger(scores[key]) && scores[key] >= 0 && scores[key] <= 4));
      if (missing) {
        notice.textContent = 'Elige una opción en «'+missing[1]+'». También puedes marcar «No evaluable / No aplica».';
        stage.querySelector('input[name="conf-d1-'+missing[0]+'"]').focus({preventScroll:true}); return;
      }
      saving = true; stage.inert = true; tools.inert = true; window.SPM_PRACTICE_AUDIO.stop(modal);
      try {
        await save({...prior,answers:{...answers,scores},confirmed:true}); dismiss();
      } catch {
        saving = false; stage.inert = false; tools.inert = false;
        notice.textContent = 'No se pudo guardar. Tus respuestas siguen aquí. Toca «Guardar y finalizar» para reintentar.';
      }
    },[119,1385,622,88]);
    stage.append(notice); modal.showModal();
  }
  window.SPM_CONFIDENCE_BASELINE = {open};
})();
