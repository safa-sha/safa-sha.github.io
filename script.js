document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.querySelector('#detail-modal');
  const title = dialog.querySelector('#modal-title');
  const kicker = dialog.querySelector('.modal-kicker');
  const body = dialog.querySelector('.modal-body');
  const actions = dialog.querySelector('.modal-actions');

  function openModal(heading, label, content, links = []) {
    title.textContent = heading;
    kicker.textContent = label;
    body.replaceChildren(content);
    actions.replaceChildren(...links);
    dialog.showModal();
  }

  document.querySelectorAll('.project-detail-button').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.project');
      const content = document.createElement('div');
      const description = card.querySelector('.project-info > p');
      const tags = card.querySelector('.tags');
      const overview = document.createElement('section');
      overview.className = 'project-detail-section';
      const overviewHeading = document.createElement('h3');
      overviewHeading.textContent = 'Overview';
      overview.append(overviewHeading);

      if (description) overview.append(description.cloneNode(true));
      content.append(overview);

      if (tags) {
        const technologies = document.createElement('section');
        technologies.className = 'project-detail-section';
        const technologiesHeading = document.createElement('h3');
        technologiesHeading.textContent = 'Technologies';
        technologies.append(technologiesHeading, tags.cloneNode(true));
        content.append(technologies);
      }

      const gallery = document.createElement('div');
      gallery.className = 'project-gallery';
      (card.dataset.screenshots || '').split('|').filter(Boolean).forEach((src, index) => {
        const image = document.createElement('img');
        image.src = src;
        image.alt = `${card.querySelector('h3').textContent} screenshot ${index + 1}`;
        image.onerror = () => {
          const note = document.createElement('p');
          note.className = 'file-note';
          note.textContent = `Screenshot needed: ${src}`;
          image.replaceWith(note);
        };
        gallery.append(image);
      });
      const screenshots = document.createElement('section');
      screenshots.className = 'project-detail-section';
      const screenshotsHeading = document.createElement('h3');
      screenshotsHeading.textContent = 'Screenshots';
      screenshots.append(screenshotsHeading, gallery);
      content.append(screenshots);

      const links = [...card.querySelectorAll('.project-link')].map(link => {
        const modalLink = document.createElement('a');
        modalLink.href = link.href;
        modalLink.target = '_blank';
        modalLink.rel = 'noopener noreferrer';
        modalLink.textContent = link.textContent;
        return modalLink;
      });

      if (card.dataset.repository) {
        const repositoryLink = document.createElement('a');
        repositoryLink.href = card.dataset.repository;
        repositoryLink.target = '_blank';
        repositoryLink.rel = 'noopener noreferrer';
        repositoryLink.textContent = 'Explore Code';
        links.push(repositoryLink);
      }

      openModal(card.querySelector('h3').textContent, 'Project details', content, links);
    });
  });

  function openCredential(button) {
      const content = document.createElement('div');
      const files = button.dataset.files.split('|').filter(Boolean);
      const labels = (button.dataset.labels || '').split('|');
      const picker = document.createElement('div');
      picker.className = 'credential-preview-controls';
      const previewArea = document.createElement('div');
      previewArea.className = 'credential-preview-area';
      content.append(picker, previewArea);

      let selection = 0;
      const showFile = async index => {
        selection = index;
        picker.querySelectorAll('button').forEach((option, optionIndex) => {
          option.classList.toggle('is-active', optionIndex === index);
          option.setAttribute('aria-pressed', String(optionIndex === index));
        });
        previewArea.replaceChildren();

        const file = files[index];
        const label = labels[index] || file.split('/').pop();
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
          try {
            const response = await fetch(file, { method: 'HEAD', cache: 'no-store' });
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
          } catch (error) {
            if (selection !== index) return;
            const note = document.createElement('p');
            note.className = 'file-note';
            note.textContent = `${label} is not available yet. Add the file at ${file}.`;
            previewArea.replaceChildren(note);
            return;
          }
        }

        if (selection !== index) return;
        if (/\.(png|jpe?g|gif|webp|avif)$/i.test(file)) {
          const image = document.createElement('img');
          image.className = 'credential-preview-image';
          image.alt = label;
          image.src = file;
          image.addEventListener('error', () => {
            const note = document.createElement('p');
            note.className = 'file-note';
            note.textContent = `${label} is not available yet. Add the file at ${file}.`;
            previewArea.replaceChildren(note);
          }, { once: true });
          previewArea.replaceChildren(image);
        } else {
          const preview = document.createElement('iframe');
          preview.className = 'credential-preview';
          preview.title = `${label} preview`;
          preview.src = file;
          previewArea.replaceChildren(preview);
        }
      };

      files.forEach((file, index) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.textContent = labels[index] || file.split('/').pop();
        option.addEventListener('click', () => showFile(index));
        picker.append(option);
      });

      const year = button.dataset.year ? ` · ${button.dataset.year}` : '';
      openModal(button.dataset.title, `${button.dataset.org}${year}`, content);
      showFile(0);
  }

  document.querySelectorAll('.credential-open').forEach(button => {
    button.addEventListener('click', () => openCredential(button));
  });

  document.querySelector('.achievement-preview').addEventListener('click', () => {
    openCredential({
      dataset: {
        title: 'Certificate of Merit — Computer Science (100/100)',
        org: 'CISCE',
        year: '2025',
        files: 'images/credentials/cisce-merit.jpg'
      }
    });
  });

  document.querySelector('.modal-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  document.querySelectorAll('.project-screenshot').forEach(image => {
    const placeholder = image.parentElement.querySelector('.screenshot-placeholder');
    const showPlaceholder = () => {
      image.hidden = true;
      if (placeholder) placeholder.hidden = false;
    };
    const hidePlaceholder = () => {
      image.hidden = false;
      if (placeholder) placeholder.hidden = true;
    };

    image.addEventListener('load', hidePlaceholder);
    image.addEventListener('error', showPlaceholder);

    if (image.complete) {
      if (image.naturalWidth) hidePlaceholder();
      else showPlaceholder();
    }
  });

  function setupFilters(selector, items) {
    const group = document.querySelector(selector);
    if (!group) return;

    group.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        group.querySelectorAll('button').forEach(option => {
          option.classList.remove('is-active');
          option.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('is-active');
        button.setAttribute('aria-pressed', 'true');
        items.forEach(item => {
          const categories = (item.dataset.category || '').split(/\s+/);
          item.hidden = button.dataset.filter !== 'all' && !categories.includes(button.dataset.filter);
        });
        const otherProjects = group.closest('.projects')?.querySelector('.other-projects');
        if (otherProjects) {
          otherProjects.hidden = !otherProjects.querySelector('.other-project:not([hidden])');
        }
      });
    });
  }

  setupFilters('.project-filters', [...document.querySelectorAll('.project, .other-project')]);
});
