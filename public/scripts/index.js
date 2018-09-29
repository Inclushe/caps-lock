document.body.querySelector('form').addEventListener('submit', (e) => {
  e.target.querySelector('input[type="submit"]').disabled = 'true'
})