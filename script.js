(function(){
  var $=function(id){return document.getElementById(id)};
  var digits=function(v){return String(v || '').replace(/\D/g,'')};
  if(!$('f')) return;
  function mask(el,fn){el.addEventListener('input',function(){el.value=fn(digits(el.value))})}
  mask($('cpf'),function(d){d=d.slice(0,11);return d.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')});
  mask($('nasc'),function(d){d=d.slice(0,8);return d.replace(/(\d{2})(\d)/,'$1/$2').replace(/(\d{2})(\d)/,'$1/$2')});
  mask($('tel'),function(d){d=d.slice(0,11);return d.length>10?d.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3'):d.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3').replace(/-$/,'')});

  mask($('cep'),function(d){d=d.slice(0,8);return d.replace(/(\d{5})(\d)/,'$1-$2')});

  function cpfOk(c){
    c=digits(c);if(c.length!==11||/^(\d)\1+$/.test(c))return false;
    for(var t=9;t<11;t++){var s=0;for(var i=0;i<t;i++)s+=c[i]*(t+1-i);var r=(s*10)%11%10;if(r!=c[t])return false}
    return true;
  }
  function ageOk(v){
    var m=v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)return false;
    var d=new Date(+m[3],m[2]-1,+m[1]);if(d.getDate()!=+m[1]||d.getMonth()!=m[2]-1)return false;
    var n=new Date(),a=n.getFullYear()-d.getFullYear();
    if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))a--;
    return a>=16&&a<=69;
  }
  var rules={
    nome:function(v){return v.trim().split(/\s+/).length>=2},
    cpf:cpfOk,nasc:ageOk,
    email:function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)},
    tel:function(v){var n=digits(v).length;return n===10||n===11}
  };
  function mark(id,ok){var el=$(id),f=el.closest('.field');f.classList.toggle('bad',!ok);el.classList.toggle('invalid',!ok);el.setAttribute('aria-invalid',!ok)}
  Object.keys(rules).forEach(function(id){$(id).addEventListener('blur',function(){mark(id,rules[id]($(id).value))})});

  $('f').addEventListener('submit',function(e){
    e.preventDefault();
    var first=null,all=true;
    Object.keys(rules).forEach(function(id){var ok=rules[id]($(id).value);mark(id,ok);if(!ok){all=false;first=first||$(id)}});
    var t=$('aceite').checked;$('termsField').classList.toggle('bad',!t);
    if(!t){all=false;first=first||$('aceite')}
    if(!all){first.focus();return}
    var n=$('nasc').value.split('/');
    var dados={
      nome:$('nome').value.trim(),
      cpf:$('cpf').value,
      data_nascimento:n[2]+'-'+n[1]+'-'+n[0],   // formato DATE do banco (aaaa-mm-dd)
      sexo:$('sexo').value||null,
      telefone:$('tel').value,
      email:$('email').value.trim(),
      tipo_sanguineo:$('tipo').value||null,
      logradouro:$('logradouro').value.trim()||null,
      numero:$('numero').value.trim()||null,
      bairro:$('bairro').value.trim()||null,
      cidade:$('cidade').value.trim()||null,
      estado:$('estado').value.toUpperCase()||null,
      cep:$('cep').value||null,
      observacoes:$('obs').value.trim()||null
    };
    var btn=$('f').querySelector('button[type=submit]'),erro=$('erroGeral');
    btn.disabled=true;erro.style.display='none';
    fetch('/api/doadores',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(dados)})
      .then(function(r){return r.json().catch(function(){return {}}).then(function(b){if(!r.ok)throw new Error(b.erro||'Não foi possível cadastrar.');return b})})
      .then(function(b){
        $('okMsg').textContent='Obrigado, '+dados.nome.split(/\s+/)[0]+'! Seu cadastro foi enviado.';
        $('f').style.display='none';$('ok').classList.add('show');
      })
      .catch(function(err){erro.textContent=err.message;erro.style.display='block'})
      .then(function(){btn.disabled=false});
  });
})();			