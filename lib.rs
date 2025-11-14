#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![close_window, minimize_window, toggle_maximize_window])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn minimize_window(window: tauri::Window) {
  window.minimize().unwrap();
}

#[tauri::command]
fn toggle_maximize_window(window: tauri::Window) {
  if window.is_maximized().unwrap() {
    window.unmaximize().unwrap();
  } else {
    window.maximize().unwrap();
  }
}

#[tauri::command]
fn close_window(window: tauri::Window) {
  window.close().unwrap();
}
