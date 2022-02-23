// MathJax Configuration
//
// v2 to v3 upgrade notes:
// - The CommonHTML.linebreaks option is not yet implemented (but may be in a future release)
// - The TeX.noUndefined.attributes option is not yet implemented (but may be in a future release)
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    ignoreHtmlClass: 'ignoreTex',    //  class that marks tags not to search
    packages: {'[+]': ['noerrors']},
    skipHtmlTags: [            //  HTML tags that won't be searched for math
        'script', 'noscript', 'style', 'textarea', 'pre',
        'code', 'annotation', 'annotation-xml', 'g',
    ],
  },
  loader: {
    load: ['[tex]/noerrors']
  }
};
