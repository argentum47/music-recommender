var like = document.querySelector("#like");

like.addEventListener("click", function(e) {
  e.preventDefault();
  fetch(`${sd.dataset.id}/add`, { credentials: 'include' })
  .then(resp => resp.json())
  .catch(resp => resp.text())
  .then((data) => {
    console.log(data);
  })
});
