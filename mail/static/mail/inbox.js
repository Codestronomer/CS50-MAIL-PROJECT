document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');

});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none'

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_mail(event) {
    event.preventDefault();

    fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
      })
    })
    .then(response => load_mailbox('sent'));
}


function view_mail(mail_id) {
  fetch('/emails/' + mail_id)
  .then(response => response.json()).then(data => {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    
    const mail_id_div = document.querySelector('#email-view');
    mail_id_div.innerHTML = `<h2>${data['subject']}</h2>
                              <span><b>From:</b> ${data['sender']}</span>
                              <p><b>Recipients:</b> <span>${data['recipients']}</span></p>
                              <p><span><i>${data['timestamp']}</i></span></p>
                              <hr>
                              <p>${data['body']}`

    if(!data['read']) {
      fetch('/emails/' + mail_id, {
        method: 'PUT',
        body: JSON.stringify({ read : true })
      })
    }

    const archive_button = document.createElement('button');
    archive_button.className = 'btn-primary m-1';
    if (data['archived']) {
      archive_button.innerHTML = 'Unarchive' }
    else {archive_button.innerHTML = 'Archive'};
    archive_button.addEventListener('click', function() {
      fetch('/emails/' + mail_id, {
        method: 'PUT',
        body: JSON.stringify({ archived: !data['archived'] })
      })
      .then(response => load_mailbox('inbox'))
    });
    mail_id_div.append(archive_button)

    const reply_button = document.createElement('button');
    reply_button.className = 'btn-secondary m-1';
    reply_button.addEventListener('click', ()=>compose_email)
    document.getElementById('compose-recipients').innerText = data['sender']
    document.getElementById('compose-subject').innerText = `Re: ${data['subject']}`
    document.getElementById('compose-body').innerText =`On ${data['timestamp']}; ${data['sender']} wrote: ${data['body']}`
    mail_id_div.append(reply_button)
  })
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(function(data) {
    data.forEach(element => {
      let email_div = document.createElement('div');
      if(element['read']) { 
        email_div.className = 'read-mail'}
      else { email_div.className = 'unread-mail'};
      email_div.id = 'email-div-id'
      email_div.innerHTML = `
        <span><b>Subject: ${element['subject']}</b></span>
        <span>From: ${element['sender']}</span>
        <span>Time: <i>${element['timestamp']}</i></span>
        `;

      email_div.addEventListener('click', () => view_mail(element['id']));
      document.querySelector('#emails-view').appendChild(email_div);
    })
  })
}

