---
title: 'Multiple languages'
spacing: all
blocks:
  _component: building-blocks/core-elements/code-block
  tabs:
    - label: HTML
      language: HTML
      filename: index.html
      description: The markup for a small status message.
      code: |-
        <p class="status-message" data-status="ready">
          Your workspace is ready.
        </p>
    - label: CSS
      language: CSS
      filename: styles.css
      description: The presentation layer for the status message.
      code: |-
        .status-message {
          color: var(--color-text-strong);
          font-weight: 600;
        }
    - label: JavaScript
      language: JavaScript
      filename: status.js
      description: The small behavior layer for updating its state.
      code: |-
        const message = document.querySelector(".status-message");

        message.dataset.status = "complete";
        message.textContent = "Your workspace is ready.";
---
