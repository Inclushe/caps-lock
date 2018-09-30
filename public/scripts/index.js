document.body.querySelector('form').addEventListener('submit', function (e) {
  e.target.querySelector('input[type="submit"]').disabled = 'true'
})

Array.from(document.body.querySelectorAll('.form-element__input')).forEach(function (node) {
  node.addEventListener('keypress', function () {
    if (node.parentElement.classList.contains('error')) {
      node.parentElement.classList.remove('error')
    }
  })
})

var loadingPosts = false
var page = 2

function loadPosts (container) {
  if (!loadingPosts) {
    loadingPosts = true
    window
      .fetch('/post/' + page++)
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        if (data.error === false) {
          if (data.posts.length !== 0) {
            console.log(data.posts)
            data.posts.forEach(function (post) {
              var postTemplate = document.querySelector('#postTemplate').innerHTML
              console.log('test')
              postTemplate = postTemplate.replace('{{ avatarURL }}', post.user.avatarURL)
              postTemplate = postTemplate.replace('{{ created_at }}', post.created_at)
              postTemplate = postTemplate.replace(/{{ name }}/g, post.user.name)
              postTemplate = postTemplate.replace('{{ content }}', post.content)
              container.innerHTML += postTemplate
            })
            loadingPosts = false
          }
        } else {
          loadingPosts = false
        }
      })
      .catch(function (e) {
        console.error(e)
      })
  }
}

if (window.location.pathname === '/') {
  var postContainer = document.querySelector('.post-container')

  window.addEventListener('scroll', function () {
    var pixelsFromBottom = (window.pageYOffset + window.innerHeight - document.body.scrollHeight)
    if (pixelsFromBottom > -400) {
      loadPosts(postContainer)
    }
  })
}
