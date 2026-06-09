export interface ITestSeed {
  description: string;
  assertCode: string;
}

export interface IAssessmentSeed {
  title: string;
  description: string;
  type: 'html' | 'css' | 'javascript';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  templateHtml?: string;
  templateCss?: string;
  templateJs?: string;
  testCases: ITestSeed[];
}

export const generate100Assessments = (): IAssessmentSeed[] => {
  const list: IAssessmentSeed[] = [];

  // ==========================================
  // 1. HTML CHALLENGES (1 to 35)
  // ==========================================
  const htmlTags = [
    { tag: 'p', name: 'Paragraph tag', content: 'Create a paragraph tag containing the text "Hello World".', desc: 'Should contain a <p> tag with the text "Hello World"', assert: "const p = doc.querySelector('p'); !!p && p.textContent.trim().toLowerCase().includes('hello world')" },
    { tag: 'h1', name: 'Heading 1', content: 'Create an h1 tag containing the text "Main Title".', desc: 'Should contain an <h1> tag with the text "Main Title"', assert: "const h1 = doc.querySelector('h1'); !!h1 && h1.textContent.trim().toLowerCase().includes('main title')" },
    { tag: 'h2', name: 'Heading 2', content: 'Create an h2 tag containing the text "Subtitle".', desc: 'Should contain an <h2> tag with the text "Subtitle"', assert: "const h2 = doc.querySelector('h2'); !!h2 && h2.textContent.trim().toLowerCase().includes('subtitle')" },
    { tag: 'h3', name: 'Heading 3', content: 'Create an h3 tag containing the text "Section Title".', desc: 'Should contain an <h3> tag with the text "Section Title"', assert: "const h3 = doc.querySelector('h3'); !!h3 && h3.textContent.trim().toLowerCase().includes('section title')" },
    { tag: 'a', name: 'Anchor Link', content: 'Create an anchor link <a> pointing to "https://google.com" with the text "Go to Google".', desc: 'Should contain an <a> tag pointing to Google', assert: "const a = doc.querySelector('a'); !!a && a.getAttribute('href') === 'https://google.com' && a.textContent.trim().toLowerCase().includes('google')" },
    { tag: 'img', name: 'Image element', content: 'Create an image <img> tag with a src value "https://picsum.photos/200" and an alt description "Random image".', desc: 'Should contain an <img> tag with src and alt properties', assert: "const img = doc.querySelector('img'); !!img && img.getAttribute('src') === 'https://picsum.photos/200' && img.getAttribute('alt') === 'Random image'" },
    { tag: 'ul', name: 'Unordered List', content: 'Create an unordered list <ul> containing exactly 3 list item <li> elements with texts: "Apple", "Banana", "Cherry".', desc: 'Should contain a <ul> tag with 3 <li> children containing Apple, Banana, Cherry', assert: "const ul = doc.querySelector('ul'); const lis = doc.querySelectorAll('ul > li'); !!ul && lis.length === 3 && lis[0].textContent.includes('Apple') && lis[1].textContent.includes('Banana') && lis[2].textContent.includes('Cherry')" },
    { tag: 'ol', name: 'Ordered List', content: 'Create an ordered list <ol> containing exactly 4 list item <li> elements with texts: "First", "Second", "Third", "Fourth".', desc: 'Should contain an <ol> tag with 4 <li> children', assert: "const ol = doc.querySelector('ol'); const lis = doc.querySelectorAll('ol > li'); !!ol && lis.length === 4 && lis[0].textContent.includes('First') && lis[3].textContent.includes('Fourth')" },
    { tag: 'strong', name: 'Strong Bold', content: 'Create a paragraph containing a <strong> element wrapping the word "Important".', desc: 'Should contain a <strong> tag wrapping "Important"', assert: "const strong = doc.querySelector('strong'); !!strong && strong.textContent.trim().toLowerCase() === 'important'" },
    { tag: 'em', name: 'Emphasis Italic', content: 'Create a paragraph containing an <em> element wrapping the word "Accent".', desc: 'Should contain an <em> tag wrapping "Accent"', assert: "const em = doc.querySelector('em'); !!em && em.textContent.trim().toLowerCase() === 'accent'" },
    { tag: 'blockquote', name: 'Blockquote element', content: 'Create a <blockquote> element quoting the phrase "Think different".', desc: 'Should contain a <blockquote> tag with the quote "Think different"', assert: "const bq = doc.querySelector('blockquote'); !!bq && bq.textContent.trim().toLowerCase().includes('think different')" },
    { tag: 'code', name: 'Code block tag', content: 'Create a <code> element containing the text "const x = 10;".', desc: 'Should contain a <code> tag with source text', assert: "const code = doc.querySelector('code'); !!code && code.textContent.includes('const x = 10;')" },
    { tag: 'main', name: 'Main semantic tag', content: 'Create a <main> semantic layout element wrapping a paragraph.', desc: 'Should contain a <main> tag containing a <p>', assert: "const main = doc.querySelector('main'); !!main && doc.querySelector('main p') !== null" },
    { tag: 'header', name: 'Header semantic tag', content: 'Create a <header> semantic element wrapping an h1 title.', desc: 'Should contain a <header> tag wrapping an <h1>', assert: "const header = doc.querySelector('header'); !!header && doc.querySelector('header h1') !== null" },
    { tag: 'footer', name: 'Footer semantic tag', content: 'Create a <footer> semantic element wrapping a paragraph with copy text.', desc: 'Should contain a <footer> tag wrapping a <p>', assert: "const footer = doc.querySelector('footer'); !!footer && doc.querySelector('footer p') !== null" },
    { tag: 'section', name: 'Section semantic tag', content: 'Create a <section> element wrapping an h2 title and a paragraph.', desc: 'Should contain a <section> wrapping <h2> and <p>', assert: "const section = doc.querySelector('section'); !!section && doc.querySelector('section h2') !== null && doc.querySelector('section p') !== null" },
    { tag: 'article', name: 'Article semantic tag', content: 'Create an <article> element containing an h3 and a paragraph.', desc: 'Should contain an <article> wrapping <h3> and <p>', assert: "const article = doc.querySelector('article'); !!article && doc.querySelector('article h3') !== null && doc.querySelector('article p') !== null" },
    { tag: 'aside', name: 'Aside semantic tag', content: 'Create an <aside> element containing secondary information text.', desc: 'Should contain an <aside> tag', assert: "const aside = doc.querySelector('aside'); !!aside && aside.textContent.trim().length > 0" },
    { tag: 'form', name: 'Form Container', content: 'Create a <form> container element with action set to "#" and method set to "POST".', desc: 'Should contain a <form> tag with action and method attributes', assert: "const form = doc.querySelector('form'); !!form && form.getAttribute('action') === '#' && form.getAttribute('method') === 'POST'" },
    { tag: 'input-text', name: 'Text Input', content: 'Create a text <input> element with type "text", name "username", and placeholder "Enter username".', desc: 'Should contain a username text input field', assert: "const input = doc.querySelector('input[type=\"text\"]'); !!input && input.getAttribute('name') === 'username' && input.getAttribute('placeholder') === 'Enter username'" },
    { tag: 'input-submit', name: 'Submit Button', content: 'Create a submit button inside a form using <input type="submit" value="Register Now">.', desc: 'Should contain a submit input button', assert: "const btn = doc.querySelector('input[type=\"submit\"]'); !!btn && btn.getAttribute('value') === 'Register Now'" },
    { tag: 'input-checkbox', name: 'Checkbox element', content: 'Create a checkbox input element with name "agree" and make it checked by default.', desc: 'Should contain a checked checkbox input named agree', assert: "const checkbox = doc.querySelector('input[type=\"checkbox\"]'); !!checkbox && checkbox.getAttribute('name') === 'agree' && checkbox.checked === true" },
    { tag: 'input-radio', name: 'Radio button selections', content: 'Create two radio buttons with type "radio", sharing the same name "gender", with values "male" and "female".', desc: 'Should contain two radio buttons named gender', assert: "const radios = doc.querySelectorAll('input[type=\"radio\"][name=\"gender\"]'); radios.length === 2 && (radios[0].value === 'male' || radios[0].value === 'female')" },
    { tag: 'textarea', name: 'Textarea input', content: 'Create a <textarea> element with rows set to 5 and columns set to 30.', desc: 'Should contain a <textarea> with rows=5 and cols=30', assert: "const ta = doc.querySelector('textarea'); !!ta && ta.getAttribute('rows') === '5' && ta.getAttribute('cols') === '30'" },
    { tag: 'select', name: 'Select Dropdown', content: 'Create a <select> element named "city" containing three options with values "london", "paris", "tokyo".', desc: 'Should contain a select dropdown with London, Paris, Tokyo options', assert: "const select = doc.querySelector('select[name=\"city\"]'); const opts = doc.querySelectorAll('select > option'); !!select && opts.length === 3 && opts[0].value === 'london' && opts[1].value === 'paris' && opts[2].value === 'tokyo'" },
    { tag: 'table', name: 'Table structures', content: 'Create a <table> element containing a table head <thead> with headers "Name" and "Role".', desc: 'Should contain a table with Name and Role headers', assert: "const table = doc.querySelector('table'); const ths = doc.querySelectorAll('table th'); !!table && ths.length === 2 && ths[0].textContent.includes('Name') && ths[1].textContent.includes('Role')" },
    { tag: 'table-body', name: 'Table content cells', content: 'Create a <table> containing a table body <tbody> with a row containing cells: "John Doe" and "Student".', desc: 'Should contain a table row with cell values', assert: "const tds = doc.querySelectorAll('table td'); tds.length >= 2 && tds[0].textContent.includes('John Doe') && tds[1].textContent.includes('Student')" },
    { tag: 'details', name: 'Details & Summary widgets', content: 'Create a <details> disclosure element wrapping a <summary> element with title "More details" and details text below.', desc: 'Should contain details wrapping summary title', assert: "const details = doc.querySelector('details'); const summary = doc.querySelector('details > summary'); !!details && !!summary && summary.textContent.includes('More details')" },
    { tag: 'canvas', name: 'Canvas drawing context', content: 'Create a <canvas> drawing element with width set to 400 and height set to 300.', desc: 'Should contain a canvas element with dimensions', assert: "const canvas = doc.querySelector('canvas'); !!canvas && canvas.getAttribute('width') === '400' && canvas.getAttribute('height') === '300'" },
    { tag: 'audio', name: 'Audio player element', content: 'Create an <audio> element with controls enabled and source set to "song.mp3".', desc: 'Should contain an audio element with controls and src', assert: "const audio = doc.querySelector('audio'); !!audio && audio.hasAttribute('controls') && audio.getAttribute('src') === 'song.mp3'" },
    { tag: 'video', name: 'Video player element', content: 'Create a <video> element with controls and width set to 640.', desc: 'Should contain a video element with controls and width=640', assert: "const video = doc.querySelector('video'); !!video && video.hasAttribute('controls') && video.getAttribute('width') === '640'" },
    { tag: 'label', name: 'Label mappings', content: 'Create an input with id "email-input" and a <label> with a "for" attribute pointing to "email-input".', desc: 'Should contain a label with for attribute mapped to input ID', assert: "const label = doc.querySelector('label'); const input = doc.querySelector('#email-input'); !!label && !!input && label.getAttribute('for') === 'email-input'" },
    { tag: 'iframe', name: 'IFrame Embed', content: 'Create an <iframe> element pointing to "https://example.com" with frame border set to 0.', desc: 'Should contain an iframe pointing to example.com', assert: "const iframe = doc.querySelector('iframe'); !!iframe && iframe.getAttribute('src') === 'https://example.com' && iframe.getAttribute('frameborder') === '0'" },
    { tag: 'span', name: 'Span element inline', content: 'Create a paragraph containing a <span> tag with an inline style setting the text color to red.', desc: 'Should contain a span element with color styling set to red', assert: "const span = doc.querySelector('span'); !!span && (span.style.color === 'red' || span.style.color === 'rgb(255, 0, 0)')" },
    { tag: 'fieldset', name: 'Fieldset groupings', content: 'Create a <fieldset> form grouping containing a <legend> with text "Contact Details".', desc: 'Should contain a fieldset element wrapping a legend element', assert: "const fs = doc.querySelector('fieldset'); const lg = doc.querySelector('fieldset > legend'); !!fs && !!lg && lg.textContent.includes('Contact Details')" }
  ];

  htmlTags.forEach((item, idx) => {
    const isEasy = idx < 15;
    const isMedium = idx >= 15 && idx < 30;
    list.push({
      title: `HTML: ${item.name}`,
      description: `Task: ${item.content}\n\nMake sure your markup follows correct syntax rules.`,
      type: 'html',
      difficulty: isEasy ? 'easy' : (isMedium ? 'medium' : 'hard'),
      points: isEasy ? 10 : (isMedium ? 20 : 30),
      templateHtml: `<!-- Write your HTML code below -->\n\n`,
      templateCss: `/* Not required for this assessment */`,
      templateJs: `// Not required for this assessment`,
      testCases: [
        {
          description: item.desc,
          assertCode: item.assert
        }
      ]
    });
  });

  // ==========================================
  // 2. CSS CHALLENGES (36 to 70)
  // ==========================================
  const cssStyles = [
    { name: 'Background Color', prop: 'background-color', value: 'red', desc: 'Set background color of .target to red', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.backgroundColor === 'rgb(255, 0, 0)' || style.backgroundColor === 'red'" },
    { name: 'Text Color', prop: 'color', value: 'white', desc: 'Set text color of .target to white', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.color === 'rgb(255, 255, 255)' || style.color === 'white'" },
    { name: 'Font Size', prop: 'font-size', value: '24px', desc: 'Set font size of .target to 24px', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.fontSize === '24px'" },
    { name: 'Padding styling', prop: 'padding', value: '20px', desc: 'Set padding of .target to 20px', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.paddingTop === '20px' && style.paddingBottom === '20px'" },
    { name: 'Border Radius', prop: 'border-radius', value: '8px', desc: 'Set border radius of .target to 8px', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.borderRadius === '8px'" },
    { name: 'Width dimension', prop: 'width', value: '300px', desc: 'Set width of .target to 300px', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.width === '300px'" },
    { name: 'Height dimension', prop: 'height', value: '150px', desc: 'Set height of .target to 150px', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.height === '150px'" },
    { name: 'Margin auto', prop: 'margin', value: 'auto', desc: 'Set margin of .target to auto', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.marginLeft !== '0px' || style.marginRight !== '0px'" },
    { name: 'Text Alignment', prop: 'text-align', value: 'center', desc: 'Set text alignment of .target to center', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.textAlign === 'center'" },
    { name: 'Box Shadow Glow', prop: 'box-shadow', value: '0px 4px 10px rgba(0,0,0,0.5)', desc: 'Add a box shadow to .target', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.boxShadow !== 'none'" },
    { name: 'Display Flexbox', prop: 'display', value: 'flex', desc: 'Set display property of .target to flex', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.display === 'flex'" },
    { name: 'Justify Content Center', prop: 'justify-content', value: 'center', desc: 'Set justify-content of .target to center', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.justifyContent === 'center'" },
    { name: 'Align Items Center', prop: 'align-items', value: 'center', desc: 'Set align-items of .target to center', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.alignItems === 'center'" },
    { name: 'Flex Direction Column', prop: 'flex-direction', value: 'column', desc: 'Set flex-direction of .target to column', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.flexDirection === 'column'" },
    { name: 'Flexbox gaps', prop: 'gap', value: '15px', desc: 'Set flexbox gap spacing of .target to 15px', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.gap === '15px'" },
    { name: 'CSS Borders', prop: 'border', value: '2px solid red', desc: 'Set solid red border on .target', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.borderWidth === '2px' && (style.borderColor === 'rgb(255, 0, 0)' || style.borderColor === 'red')" },
    { name: 'Cursor Pointer', prop: 'cursor', value: 'pointer', desc: 'Set button cursor to pointer on .target', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.cursor === 'pointer'" },
    { name: 'Gradients background', prop: 'background', value: 'linear-gradient', desc: 'Add linear-gradient background to .target', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.backgroundImage.includes('linear-gradient')" },
    { name: 'Fonts weighting', prop: 'font-weight', value: 'bold', desc: 'Set font weight of .target to bold', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.fontWeight === '700' || style.fontWeight === 'bold'" },
    { name: 'Opacity adjustment', prop: 'opacity', value: '0.7', desc: 'Set opacity of .target to 0.7', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); Math.abs(parseFloat(style.opacity) - 0.7) < 0.05" },
    { name: 'List style formatting', prop: 'list-style', value: 'none', desc: 'Remove list style styling on .target class', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.listStyleType === 'none'" },
    { name: 'Text shadow styling', prop: 'text-shadow', value: '1px 1px 2px black', desc: 'Add text shadow to .target', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.textShadow !== 'none'" },
    { name: 'Font Styling italic', prop: 'font-style', value: 'italic', desc: 'Set font style of .target to italic', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.fontStyle === 'italic'" },
    { name: 'Outline adjustments', prop: 'outline', value: 'none', desc: 'Set outline border to none on .target class', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.outlineWidth === '0px' || style.outlineStyle === 'none'" },
    { name: 'Positions relative', prop: 'position', value: 'relative', desc: 'Set positioning layout of .target to relative', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.position === 'relative'" },
    { name: 'Positions absolute', prop: 'position', value: 'absolute', desc: 'Set positioning layout of .target to absolute', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.position === 'absolute'" },
    { name: 'CSS Flex Wraps', prop: 'flex-wrap', value: 'wrap', desc: 'Set flex wrap configuration of .target to wrap', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.flexWrap === 'wrap'" },
    { name: 'Font letter spacings', prop: 'letter-spacing', value: '2px', desc: 'Set font letter spacing of .target to 2px', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.letterSpacing === '2px'" },
    { name: 'Line Heights typography', prop: 'line-height', value: '1.8', desc: 'Set line height of .target to 1.8', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); parseFloat(style.lineHeight) > 1.5" },
    { name: 'Element visibility', prop: 'visibility', value: 'hidden', desc: 'Set element visibility to hidden on .target class', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.visibility === 'hidden'" },
    { name: 'Z-Indexing priorities', prop: 'z-index', value: '10', desc: 'Set rendering z-index of .target to 10', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.zIndex === '10'" },
    { name: 'Transition configurations', prop: 'transition', value: 'all 0.3s ease', desc: 'Set styling transition animations on .target class', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.transitionProperty !== 'none'" },
    { name: 'CSS transforms scale', prop: 'transform', value: 'scale(1.2)', desc: 'Apply a scale transform style of 1.2 on .target class', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.transform !== 'none'" },
    { name: 'CSS box resizing border-box', prop: 'box-sizing', value: 'border-box', desc: 'Set box sizing to border-box on .target class', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.boxSizing === 'border-box'" },
    { name: 'Filter blurs visual', prop: 'filter', value: 'blur(5px)', desc: 'Set visual blur filter on .target class', assert: "const style = window.getComputedStyle(doc.querySelector('.target')); style.filter.includes('blur')" }
  ];

  cssStyles.forEach((item, idx) => {
    const isEasy = idx < 15;
    const isMedium = idx >= 15 && idx < 30;
    list.push({
      title: `CSS: ${item.name}`,
      description: `Task: Apply styling rules so that the element with class "target" has its CSS property "${item.prop}" set to "${item.value}".\n\nModify only the CSS worksheet.`,
      type: 'css',
      difficulty: isEasy ? 'easy' : (isMedium ? 'medium' : 'hard'),
      points: isEasy ? 10 : (isMedium ? 20 : 30),
      templateHtml: `<div class="target">Style me!</div>`,
      templateCss: `.target {\n  /* Apply styles below */\n\n}`,
      templateJs: `// Not required for this CSS assessment`,
      testCases: [
        {
          description: item.desc,
          assertCode: item.assert
        }
      ]
    });
  });

  // ==========================================
  // 3. JAVASCRIPT CHALLENGES (71 to 100)
  // ==========================================
  const jsChallenges = [
    { name: 'Simple Sum', fn: 'sum', arg: 'a, b', desc: 'Write a function sum(a, b) that returns the sum of a and b.', assert: "typeof sum === 'function' && sum(2, 3) === 5 && sum(-1, 4) === 3" },
    { name: 'Product Multiply', fn: 'multiply', arg: 'a, b', desc: 'Write a function multiply(a, b) that returns the product of a and b.', assert: "typeof multiply === 'function' && multiply(3, 4) === 12 && multiply(-2, 5) === -10" },
    { name: 'Check Even Number', fn: 'isEven', arg: 'num', desc: 'Write a function isEven(num) that returns true if the number is even, and false otherwise.', assert: "typeof isEven === 'function' && isEven(4) === true && isEven(7) === false" },
    { name: 'Reverse a String', fn: 'reverseString', arg: 'str', desc: 'Write a function reverseString(str) that returns the reversed representation of the input string.', assert: "typeof reverseString === 'function' && reverseString('hello') === 'olleh' && reverseString('task') === 'ksat'" },
    { name: 'Array Max Number', fn: 'getMax', arg: 'arr', desc: 'Write a function getMax(arr) that returns the maximum number in an array of numbers.', assert: "typeof getMax === 'function' && getMax([1, 5, 3]) === 5 && getMax([-5, -10]) === -5" },
    { name: 'Filter Odd Numbers', fn: 'filterOdds', arg: 'arr', desc: 'Write a function filterOdds(arr) that takes an array of numbers and returns a new array with all odd numbers removed.', assert: "typeof filterOdds === 'function' && JSON.stringify(filterOdds([1, 2, 3, 4])) === JSON.stringify([2, 4])" },
    { name: 'Count vowel characters', fn: 'countVowels', arg: 'str', desc: 'Write a function countVowels(str) that counts and returns the number of vowel characters (a, e, i, o, u) case-insensitively.', assert: "typeof countVowels === 'function' && countVowels('hello') === 2 && countVowels('TASK tracker') === 3" },
    { name: 'Leap Year Validation', fn: 'isLeapYear', arg: 'year', desc: 'Write a function isLeapYear(year) that returns true if a year is a leap year, and false otherwise.', assert: "typeof isLeapYear === 'function' && isLeapYear(2000) === true && isLeapYear(2021) === false" },
    { name: 'Is Prime Number', fn: 'isPrime', arg: 'n', desc: 'Write a function isPrime(n) that checks if a number is prime, returning true or false.', assert: "typeof isPrime === 'function' && isPrime(7) === true && isPrime(4) === false && isPrime(1) === false" },
    { name: 'Calculate Factorials', fn: 'getFactorial', arg: 'n', desc: 'Write a function getFactorial(n) that returns the factorial calculation of integer n.', assert: "typeof getFactorial === 'function' && getFactorial(5) === 120 && getFactorial(0) === 1" },
    { name: 'Convert Strings Uppercase', fn: 'toUppercaseArray', arg: 'arr', desc: 'Write a function toUppercaseArray(arr) that returns a new array of strings converted to uppercase.', assert: "typeof toUppercaseArray === 'function' && JSON.stringify(toUppercaseArray(['a', 'b'])) === JSON.stringify(['A', 'B'])" },
    { name: 'Clear Array Duplicates', fn: 'clearDuplicates', arg: 'arr', desc: 'Write a function clearDuplicates(arr) that removes duplicate entries from the array.', assert: "typeof clearDuplicates === 'function' && JSON.stringify(clearDuplicates([1, 2, 2, 3])) === JSON.stringify([1, 2, 3])" },
    { name: 'Get Fibonacci Term', fn: 'getFibonacci', arg: 'n', desc: 'Write a function getFibonacci(n) that returns the nth term in the Fibonacci sequence (0-indexed, where term 0 is 0, term 1 is 1, term 2 is 1).', assert: "typeof getFibonacci === 'function' && getFibonacci(6) === 8 && getFibonacci(1) === 1" },
    { name: 'Merge Array Elements', fn: 'mergeArrays', arg: 'arr1, arr2', desc: 'Write a function mergeArrays(arr1, arr2) that merges two arrays and returns the unified list.', assert: "typeof mergeArrays === 'function' && JSON.stringify(mergeArrays([1], [2])) === JSON.stringify([1, 2])" },
    { name: 'Get Text Word Count', fn: 'getWordCount', arg: 'str', desc: 'Write a function getWordCount(str) that returns the count of words in the string.', assert: "typeof getWordCount === 'function' && getWordCount('hello word tracker') === 3 && getWordCount('hello') === 1" },
    { name: 'Celsius to Fahrenheit', fn: 'celsiusToFahrenheit', arg: 'c', desc: 'Write a function celsiusToFahrenheit(c) that converts a Celsius temperature to Fahrenheit.', assert: "typeof celsiusToFahrenheit === 'function' && celsiusToFahrenheit(0) === 32 && celsiusToFahrenheit(100) === 212" },
    { name: 'Check Text Palindromes', fn: 'checkPalindrome', arg: 'str', desc: 'Write a function checkPalindrome(str) that checks if a string is a palindrome (reads same forward and backward).', assert: "typeof checkPalindrome === 'function' && checkPalindrome('racecar') === true && checkPalindrome('hello') === false" },
    { name: 'Get Array Average', fn: 'getAverage', arg: 'arr', desc: 'Write a function getAverage(arr) that returns the average value of numbers in the array.', assert: "typeof getAverage === 'function' && getAverage([1, 2, 3, 4]) === 2.5" },
    { name: 'Truncate text limits', fn: 'truncateString', arg: 'str, length', desc: 'Write a function truncateString(str, length) that truncates text to length and appends "..." if it exceeds it.', assert: "typeof truncateString === 'function' && truncateString('hello', 3) === 'hel...' && truncateString('hi', 5) === 'hi'" },
    { name: 'Find Longest Word', fn: 'findLongestWord', arg: 'str', desc: 'Write a function findLongestWord(str) that returns the longest word in the string.', assert: "typeof findLongestWord === 'function' && findLongestWord('web develop tools') === 'develop'" },
    { name: 'Check Anagram texts', fn: 'checkAnagram', arg: 'str1, str2', desc: 'Write a function checkAnagram(str1, str2) that returns true if two strings are anagrams of each other.', assert: "typeof checkAnagram === 'function' && checkAnagram('listen', 'silent') === true && checkAnagram('hello', 'world') === false" },
    { name: 'Fizz Buzz arrays', fn: 'fizzBuzz', arg: 'n', desc: 'Write a function fizzBuzz(n) that returns an array of numbers from 1 to n, replacing multiples of 3 with "Fizz", 5 with "Buzz", and both with "FizzBuzz".', assert: "typeof fizzBuzz === 'function' && fizzBuzz(5)[2] === 'Fizz' && fizzBuzz(5)[4] === 'Buzz'" },
    { name: 'Sum Of Digits', fn: 'sumOfDigits', arg: 'num', desc: 'Write a function sumOfDigits(num) that returns the sum of digits of a positive integer.', assert: "typeof sumOfDigits === 'function' && sumOfDigits(123) === 6 && sumOfDigits(505) === 10" },
    { name: 'Parse JSON safely', fn: 'parseJSONSafe', arg: 'str', desc: 'Write a function parseJSONSafe(str) that parses a JSON string, returning the parsed object or null if it fails.', assert: "typeof parseJSONSafe === 'function' && parseJSONSafe('{\"x\":1}').x === 1 && parseJSONSafe('{invalid}') === null" },
    { name: 'Decimal to Binary strings', fn: 'decimalToBinary', arg: 'n', desc: 'Write a function decimalToBinary(n) that converts a positive integer decimal number to its binary string representation.', assert: "typeof decimalToBinary === 'function' && decimalToBinary(10) === '1010' && decimalToBinary(3) === '11'" },
    { name: 'Perfect Square checking', fn: 'isPerfectSquare', arg: 'n', desc: 'Write a function isPerfectSquare(n) that returns true if n is a perfect square, and false otherwise.', assert: "typeof isPerfectSquare === 'function' && isPerfectSquare(16) === true && isPerfectSquare(18) === false" },
    { name: 'Count Occurrences in Array', fn: 'countOccurrences', arg: 'arr, val', desc: 'Write a function countOccurrences(arr, val) that counts occurrences of a value inside the array.', assert: "typeof countOccurrences === 'function' && countOccurrences([1, 2, 2, 3], 2) === 2 && countOccurrences([1], 5) === 0" },
    { name: 'Flatten nested arrays', fn: 'flattenArray', arg: 'arr', desc: 'Write a function flattenArray(arr) that flattens a nested two-dimensional array of numbers into a flat one-dimensional array.', assert: "typeof flattenArray === 'function' && JSON.stringify(flattenArray([[1, 2], [3]])) === JSON.stringify([1, 2, 3])" },
    { name: 'Absolute difference calculation', fn: 'getAbsoluteDiff', arg: 'a, b', desc: 'Write a function getAbsoluteDiff(a, b) that returns the absolute mathematical difference between two numbers.', assert: "typeof getAbsoluteDiff === 'function' && getAbsoluteDiff(5, 8) === 3 && getAbsoluteDiff(10, 3) === 7" },
    { name: 'String capitalization', fn: 'capitalizeWords', arg: 'str', desc: 'Write a function capitalizeWords(str) that capitalizes the first letter of every word in the string.', assert: "typeof capitalizeWords === 'function' && capitalizeWords('hello world') === 'Hello World'" }
  ];

  jsChallenges.forEach((item, idx) => {
    const isEasy = idx < 10;
    const isMedium = idx >= 10 && idx < 20;
    list.push({
      title: `JS: ${item.name}`,
      description: `Task: ${item.desc}\n\nModify only the JS worksheet.`,
      type: 'javascript',
      difficulty: isEasy ? 'easy' : (isMedium ? 'medium' : 'hard'),
      points: isEasy ? 10 : (isMedium ? 20 : 30),
      templateHtml: `<!-- Not required for this JS assessment -->`,
      templateCss: `/* Not required for this JS assessment */`,
      templateJs: `function ${item.fn}(${item.arg}) {\n  // Write your code below\n\n}`,
      testCases: [
        {
          description: item.name,
          assertCode: item.assert
        }
      ]
    });
  });

  return list;
};
