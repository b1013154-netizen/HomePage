(() => {
  const tabs = Array.from(document.querySelectorAll('.studio-tabs button'));
  tabs[0].parentElement.setAttribute('role', 'tablist');
  function select(index) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index;
    });
  }
  tabs.forEach((tab, i) => {
    tab.onclick = () => select(i);
    tab.onkeydown = event => {
      let index = i;
      if (event.key === 'ArrowRight') index = (i + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') index = (i + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else return;
      event.preventDefault(); select(index); tabs[index].focus();
    };
  });
  select(0);
  if (location.hash === '#library') {
    select(4);
    const library = document.getElementById('library');
    if (library.options.length && library.options[0].value !== '') document.getElementById('load').click();
  }
})();
