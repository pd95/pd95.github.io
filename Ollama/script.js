(() => {
  const selectors = [
    'pre > code',
    'code.command',
  ];

  const copyText = async (button, text) => {
    const original = button.textContent;

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
      button.setAttribute('aria-live', 'polite');
    } catch {
      button.textContent = 'Copy failed';
    }

    window.setTimeout(() => {
      button.textContent = original;
      button.removeAttribute('aria-live');
    }, 1600);
  };

  const addCopyButton = (node) => {
    const source = node.matches('pre > code') ? node.parentElement : node;
    if (!source || source.dataset.copyButton === 'true') {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'copyable-command';
    source.parentNode.insertBefore(wrapper, source);
    wrapper.appendChild(source);

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy command');
    button.addEventListener('click', () => copyText(button, node.textContent));
    wrapper.appendChild(button);

    source.dataset.copyButton = 'true';
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(selectors.join(',')).forEach(addCopyButton);

    document.querySelectorAll('.archive-releases .download-card').forEach((card) => {
      const terms = Array.from(card.querySelectorAll('dt'));
      const term = terms.find((node) => node.textContent.trim() === 'Highlights')
        || terms.find((node) => node.textContent.trim() === 'Disposition');
      const detail = term?.parentElement?.querySelector('dd');

      if (!term || !detail || detail.querySelector('.expandable-field')) {
        return;
      }

      const field = document.createElement('span');
      field.className = 'expandable-field';

      const summary = document.createElement('span');
      summary.className = 'expandable-summary';
      summary.textContent = term.textContent.trim() === 'Disposition'
        ? 'Release disposition.'
        : 'Release highlights and included MLX capabilities.';

      const content = document.createElement('span');
      content.className = 'expandable-content';
      while (detail.firstChild) {
        content.appendChild(detail.firstChild);
      }

      const button = document.createElement('button');
      button.className = 'expand-toggle';
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');
      button.textContent = 'Show more...';

      field.append(summary, content, button);
      detail.appendChild(field);
    });

    document.querySelectorAll('.expand-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        const field = button.closest('.expandable-field');

        if (!field) {
          return;
        }

        field.dataset.expanded = 'true';
        button.remove();
      });
    });

    document.querySelectorAll('[data-source-tabs]').forEach((tabs) => {
      const buttons = Array.from(tabs.querySelectorAll('[role="tab"]'));
      const panels = Array.from(tabs.querySelectorAll('[role="tabpanel"]'));

      const selectTab = (selected) => {
        buttons.forEach((button) => {
          const active = button === selected;
          button.setAttribute('aria-selected', String(active));
          button.tabIndex = active ? 0 : -1;
        });

        panels.forEach((panel) => {
          panel.hidden = panel.getAttribute('aria-labelledby') !== selected.id;
        });
      };

      buttons.forEach((button, index) => {
        button.addEventListener('click', () => selectTab(button));
        button.addEventListener('keydown', (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            return;
          }

          event.preventDefault();
          let next = index;
          if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
          if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = buttons.length - 1;
          buttons[next].focus();
          selectTab(buttons[next]);
        });
      });
    });
  });
})();
