export function component(responses, intent, model, view) {
  const events = intent(responses.DOM),
        DOM = view(model(responses, events));

  return {DOM, events};
}