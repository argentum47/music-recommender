function renderData(datas) {
  if(!Array.isArray(datas)) datas = [datas];

  var frag = document.createDocumentFragment();
  datas.forEach(data => {
    var li = document.createElement("li");
    li.textContent = data.name;
    frag.appendChild(li);
  });

  return frag;
}

var sd = document.querySelector("#song");

fetch(`/songs/${sd.dataset.id}/recommendations`, {credentials: 'include'})
.then(data => data.json())
.then(data => {
  var rec = document.querySelector("#recommendations");
  rec.appendChild(renderData(data));
});

