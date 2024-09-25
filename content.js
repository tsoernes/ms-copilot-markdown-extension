function getShadowRoot(element) {
  return element ? (element.shadowRoot || element.attachShadow({ mode: 'open' })) : null;
}

function extractMessages() {
  const shadowHost1 = document.querySelector(".cib-serp-main");
  if (!shadowHost1) {
    console.error("Shadow host not found");
    return;
  }
  const shadowRoot1 = getShadowRoot(shadowHost1);
  if (!shadowRoot1) {
    console.error("Shadow root not found for shadowHost1");
    return;
  }

  const shadowHost4 = shadowRoot1.querySelector("#cib-conversation-main");
  const shadowRoot4 = getShadowRoot(shadowHost4);
  if (!shadowRoot4) {
    console.error("Shadow root not found for shadowHost4");
    return;
  }

  const shadowHosts5 = shadowRoot4.querySelectorAll("#cib-chat-main > cib-chat-turn");
  const shadowRoots5 = Array.from(shadowHosts5).map(sh5 => getShadowRoot(sh5)).filter(Boolean);

  const shadowHosts6 = shadowRoots5.flatMap(sr5 => Array.from(sr5.querySelectorAll("cib-message-group")));
  const shadowRoots6 = shadowHosts6.map(sh6 => getShadowRoot(sh6)).filter(Boolean);

  const messageEls = shadowRoots6.map(sr6 => sr6.querySelector("cib-message")).filter(Boolean);
  const messages = messageEls.map(el => el.getAttribute("aria-label"));

  console.log("Extracted messages:", messages);

  let messagesWithLinks = [];

  messageEls.forEach((messageEl, index) => {
    const shadowRoot7 = getShadowRoot(messageEl);
    if (!shadowRoot7) {
      messagesWithLinks.push(messages[index]);
      return;
    }

    let shadowHost8;
    try {
      shadowHost8 = shadowRoot7.querySelector("cib-message-attributions");
    } catch (e) {
      // Message without attributions at the bottom
      messagesWithLinks.push(messages[index]);
      return;
    }

    const shadowRoot8 = getShadowRoot(shadowHost8);
    if (!shadowRoot8) {
      messagesWithLinks.push(messages[index]);
      return;
    }

    const shadowHosts9 = shadowRoot8.querySelectorAll("div > div.attribution-container > div > cib-attribution-item");
    const shadowRoots10 = Array.from(shadowHosts9).map(sh => getShadowRoot(sh)).filter(Boolean);
    const linkEls = shadowRoots10.map(sr => sr.querySelector("a")).filter(Boolean);
    let links = linkEls.map(el => {
        let ariaLabel = el.getAttribute('aria-label');
        let href = el.getAttribute('href');
        return `[${ariaLabel}](${href})`;
    }).join('\n');

    const messageWithLinks = links ? `${messages[index]}\n${links}` : messages[index];
    messagesWithLinks.push(messageWithLinks);
  });

  const conversation = messagesWithLinks.join("\n\n");
  console.log("Conversation with links:", conversation);
  return conversation;
}

