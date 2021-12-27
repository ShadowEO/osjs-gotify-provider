/*
For more information about service providers, visit:
- https://manual.os-js.org/v3/tutorial/provider/
- https://manual.os-js.org/v3/guide/provider/
- https://manual.os-js.org/v3/development/
*/
export class GotifyNotificationProvider {
  /**
   * Constructor
   * @param {Core} core Core reference
   */
  constructor(core, options = {}) {
    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;
    this.options = options;
  
  }

  depends() {
    return [
      'osjs/core'
    ];
  }
  /**
   * A list of services this provider can create
   * @desc Used for resolving a dependency graph
   * @return {string[]}
   */
  provides() {
    return [
      'gotify-provider'
    ];
  }

  /**
   * Initializes provider
   */
  init() {
    
    return Promise.resolve();
  }

  /**
   * Starts provider
   */
  start() {
    const uri = this.core.make('osjs/settings').get('osjs/gotify-provider', 'websocket.uri', 'tonoxisisle.services/gotify');
    const token = this.core.make('osjs/settings').get('osjs/gotify-provider', 'websocket.token');
    const proc = this.core.make('osjs/application');
    const ws = proc.socket("wss://"+uri+"/stream?token="+token);
    const cs = true

    ws.on('error', () => {
      if(this.cs == true)
      {
        this.core.make('osjs/notification', {
          message: "Gotify Websocket Closed, please set your URI and Token in Settings and refresh the desktop.",
          title: "Gotify Notification Listener"
        });
        this.cs = false;
      }
    });
    ws.on('message', ev => {
      let data = JSON.parse(ev.data);
      let target_appid = data.appid;
      //const response = proc.request('https://'+uri+"/application?token="+token);
      //await response;
      //let app_image = 'https://'+uri+response.json[target_appid].image+"?token="+token;
      this.core.make('osjs/notification', {
        message: data.message,
        title: data.title,
        icon: "https://tonoxisisle.services/gotify/static/defaultapp.png",
        onclick: () => {
          if(data.extras['client::notification'].click != null)
          {
            if(data.extras['client::notification'].click.url != null)
            {
              window.open(data.extras['client::notification'].click.url, "_blank");
            } elseif (data.extras['client::notification'].click.osjs.application != null) 
            {
              this.core.run(data.extras['client::notification'].click.osjs.application, data.extras['client::notification'].click.osjs.args);
            }
          }
        }
      })
    })
  }

  /**
   * Destroys provider
   */
  destroy() {
    ws.close();
  }

}
