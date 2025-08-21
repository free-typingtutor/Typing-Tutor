/* Virtual Keyboard renderer + highlight + heatmap */

const Keyboard = (() => {
  const layout = [
    // Function row
    ["Esc","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"],
    // Number row
    ["`","1","2","3","4","5","6","7","8","9","0","-","=","Backspace"],
    // Q row
    ["Tab","Q","W","E","R","T","Y","U","I","O","P","[","]","\\"],
    // A row
    ["CapsLock","A","S","D","F","G","H","J","K","L",";","'","Enter"],
    // Z row
    ["Shift","Z","X","C","V","B","N","M",",",".","/","Shift"],
    // Bottom mods
    ["Ctrl","Win","Alt","Space","Alt","Win","Menu","Ctrl"],
    // Navigation cluster
    ["PrtSc","ScrLk","Pause","Insert","Home","PageUp","Delete","End","PageDown"],
    // Arrows
    ["←","↑","↓","→"],
    // Numpad
    ["NumLock","Numpad/","Numpad*","Numpad-"],
    ["Numpad7","Numpad8","Numpad9","Numpad+"],
    ["Numpad4","Numpad5","Numpad6","Numpad+"],
    ["Numpad1","Numpad2","Numpad3","NumpadEnter"],
    ["Numpad0","Numpad.","NumpadEnter"]
  ];

  // Map DOM keys by label for quick lookup
  function render(containerId){
    const el = document.getElementById(containerId);
    if (!el) return null;
    el.innerHTML = '';
    const map = new Map();

    layout.forEach((row, ri) => {
      const r = document.createElement('div');
      r.className = 'kb-row';
      row.forEach(label => {
        const k = document.createElement('div');
        k.className = 'key';
        k.textContent = label;
        // sizing
        if (label === 'Backspace' || label === 'CapsLock' || label === 'Enter') k.classList.add('wide');
        if (label === 'Space') k.classList.add('space');
        if (label === 'Numpad0') k.classList.add('numpad0');
        if (label === 'Numpad+' ) k.classList.add('numpadPlus');
        if (label === 'NumpadEnter') k.classList.add('numpadEnter');

        r.appendChild(k);
        map.set(label, k);
      });
      el.appendChild(r);
    });

    return { container: el, keyMap: map };
  }

  // Browser event.key -> display label
  function normalize(eKey, eCode){
    const key = eKey;
    const lower = key.toLowerCase();

    const direct = {
      ' ': 'Space',
      'esc':'Esc', 'escape':'Esc',
      'tab':'Tab',
      'capslock':'CapsLock',
      'shift':'Shift',
      'control':'Ctrl',
      'alt':'Alt',
      'meta':'Win',
      'contextmenu':'Menu',
      'enter':'Enter',
      'backspace':'Backspace',
      'insert':'Insert','delete':'Delete','home':'Home','end':'End',
      'pageup':'PageUp','pagedown':'PageDown',
      'scrolllock':'ScrLk','pause':'Pause','printscreen':'PrtSc',
      'arrowleft':'←','arrowright':'→','arrowup':'↑','arrowdown':'↓',
      'numlock':'NumLock'
    };
    if (direct[lower]) return direct[lower];

    // Function keys
    if (/^f[1-9][0-2]?$/.test(lower)) return lower.toUpperCase();

    // Numpad via code
    if (eCode && eCode.startsWith('Numpad')) {
      // e.g., NumpadDivide, NumpadMultiply, NumpadAdd, NumpadSubtract, NumpadDecimal, NumpadEnter, Numpad1...
      const tail = eCode.replace('Numpad','');
      const specialMap = { 'Divide':'/', 'Multiply':'*', 'Subtract':'-', 'Add':'+', 'Decimal':'.' };
      if (specialMap[tail]) return 'Numpad' + specialMap[tail];
      if (tail === 'Enter') return 'NumpadEnter';
      if (/^\d$/.test(tail)) return 'Numpad' + tail;
    }

    // Printable single char
    if (key.length === 1) {
      // visible punctuation letters numbers
      return key.length === 1 ? key.toUpperCase() === key.toLowerCase() ? key : key.toUpperCase() : key;
    }

    // Fallback to code for Backquote etc if not caught
    const codeMap = {
      'Backquote':'`','Minus':'-','Equal':'=',
      'BracketLeft':'[','BracketRight':']','Backslash':'\\',
      'Semicolon':';','Quote':'\'','Comma':',','Period':'.','Slash':'/'
    };
    if (codeMap[eCode]) return codeMap[eCode];

    return key;
  }

  function highlightDown(api, e){
    if (!api) return;
    const label = normalize(e.key, e.code);
    const el = api.keyMap.get(label);
    if (el) el.classList.add('active');
  }
  function highlightUp(api, e){
    if (!api) return;
    const label = normalize(e.key, e.code);
    const el = api.keyMap.get(label);
    if (el) el.classList.remove('active');
  }

  // Char to Key label (for heatmap counting)
  function mapCharToKey(ch){
    if (!ch) return 'Space';
    const specials = {
      '\n':'Enter', '\r':'Enter', ' ':'Space'
    };
    if (specials[ch]) return specials[ch];
    // keep visible char as-is, uppercase letters to uppercase key labels
    if (ch.length===1) {
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      if (letters.includes(ch)) return ch.toUpperCase();
      if (letters.includes(ch.toLowerCase())) return ch.toUpperCase();
      return ch; // digits or punctuation
    }
    return ch;
  }

  // Heatmap coloring based on error rate per key
  function applyHeatmap(api, keyStats){
    if (!api) return;
    api.keyMap.forEach((el,label)=>{
      const s = keyStats[label] || {hits:0, errors:0};
      const rate = s.hits ? (s.errors / s.hits) : 0;
      const color = rateToColor(rate);
      el.style.boxShadow = color ? `inset 0 -4px 0 ${color}` : 'none';
      el.title = s.hits ? `${label} – errors: ${s.errors}/${s.hits} (${Math.round(rate*100)}%)` : `${label}`;
    });
  }

  function rateToColor(r){
    if (r <= 0.05) return 'var(--ok)';
    if (r <= 0.15) return 'var(--mid)';
    if (r >  0.15) return 'var(--high)';
    return '';
  }

  return { render, highlightDown, highlightUp, mapCharToKey, applyHeatmap };
})();
