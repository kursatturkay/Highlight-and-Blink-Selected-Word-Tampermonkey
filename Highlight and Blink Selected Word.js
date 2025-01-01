// ==UserScript==
// @name         Highlight and Blink Selected Word
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Optimize edilmiş seçili kelimeyi vurgulayıp yanıp söndüren script.
// @author       fablesalive games
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let previousHighlights = [];

  
  const style = document.createElement("style");
  style.textContent = `
    .highlighted {
      background-color: yellow;
      color: transparent;
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      0%, 50% {
        color: transparent;
      }
      50%, 100% {
        color: black;
      }
    }
  `;
  document.head.appendChild(style);

  
  function clearPreviousHighlights() {
    previousHighlights.forEach((el) => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
    previousHighlights = [];
  }

  
  function highlightInElement(element, word) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");

    for (const child of [...element.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const matches = [...child.textContent.matchAll(regex)];
        if (matches.length) {
          matches.forEach((match) => {
            const span = document.createElement("span");
            span.className = "highlighted";
            span.textContent = match[0];

            const range = document.createRange();
            range.setStart(child, match.index);
            range.setEnd(child, match.index + match[0].length);

            range.deleteContents();
            range.insertNode(span);

            previousHighlights.push(span);
          });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        highlightInElement(child, word); 
      }
    }
  }

  
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    const word = selection.toString().trim();

    if (!word) return;

    clearPreviousHighlights();

    
    document.querySelectorAll("body *:not(script):not(style)").forEach((el) => {
      if (el.offsetParent !== null) {
        highlightInElement(el, word);
      }
    });

    selection.removeAllRanges();
  });
})();