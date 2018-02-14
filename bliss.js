'strict mode';
const bliss = (function () {
  const views = new Map();
  const viewModels = new Map();
  const applications = [];
  const lineBreakRegExp = /\r?\n|\r/g;
  const moustacheRegExp = /\{\{(.*?)\}\}/g;
  const viewSelector = `script[language='bliss/v']`;
  const viewModelSelector = `script[language='bliss/vm']`;
  const applicationSelector = '[data-app]';

  function init () {
    loadApplications();
    loadViews();
    loadViewModels();
    run();
  };

  function loadApplications () {
    applications.push.apply(applications,
      Array.from(document.querySelectorAll(applicationSelector)).map(applicationElement => {
        return {
          'element': applicationElement,
          'namespace': applicationElement.getAttribute('data-app')
        };
      })
    );
  }

  function loadViews () {
    const viewElements = document.querySelectorAll(viewSelector);
    viewElements.forEach(viewElement => {
      views.set(
        viewElement.getAttribute('data-namespace'),
        viewElement.innerHTML.replace(lineBreakRegExp, '')
      );
    });
  }

  function loadViewModels () {
    const viewModelElements = document.querySelectorAll(viewModelSelector);
    viewModelElements.forEach(viewModelElement => {
      viewModels.set(
        viewModelElement.getAttribute('data-namespace'),
        viewModelElement.innerText.replace(lineBreakRegExp, '')
      );
    });
  }

  function run () {
    applications.forEach(application => {
      const compiledViewModel = compileViewModel(
        viewModels.get(application.namespace)
      );
      const compiledView = compileView(
        views.get(application.namespace),
        compiledViewModel
      );
      application.element.innerHTML = compiledView;
    });
  };

  function compileViewModel (viewModel) {
    /* eslint no-eval: "off" */
    return eval(`(function(){${viewModel}})();`);
  }

  function compileView (view, compiledViewModel) {
    return view.replace(moustacheRegExp, (match, token) => {
      const value = compiledViewModel[token];
      if (typeof value === 'function') {
        return value.call(compiledViewModel);
      }
      return value;
    });
  };

  return {
    init
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  bliss.init();
});
