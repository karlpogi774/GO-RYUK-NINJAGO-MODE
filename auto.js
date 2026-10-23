for (const { handleEvent, name } of Utils.handleEvent.values()) {
  if (
    typeof handleEvent !== "function" ||
    !name ||
    !(
      (enableCommands[1].handleEvent || []).includes(name) ||
      (enableCommands[0].commands || []).includes(name)
    )
  ) {
    continue;
  }

  try {
    await handleEvent({
      api,
      event,
      enableCommands,
      admin,
      prefix,
      blacklist
    });
  } catch (error) {
    console.error(`[Event Handler: ${name}]`, error.message);
  }
}
