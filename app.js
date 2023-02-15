(async () => {

  const getMetas = async () => {
    const res = await fetch('https://raw.githubusercontent.com/DanielScholte/GuildWars2Companion/master/assets/data/event_timers/meta_events.json')
    const metas = await res.json()
    console.log(metas)
    return metas
  }

  const getMetaHtml = (current, next) => `<div class="meta-container">
    <p class="current">${current.name}</p>
    <p class="next">${next.name} [${next.time}]</p>
  </div>`;

  const getRegionContainer = (title, innerHTML) => `<div class="region>
    <h3>${title}</h3>
    ${innerHTML}
  </div>`

  const metasByRegion = metas => metas.reduce((acc, m) => {
    if (!acc[m.region]) {
      acc[m.region] = []
    }
    acc[m.region].push(m)
    return acc
  }, {})

  const notPassed = (hour, minute) => {
    const currentTime = new Date()
    return +hour > currentTime.getHours() || (+hour <= currentTime.getHours() && +minute > currentTime.getMinutes())
  }

  const printMetas = async () => {
    const metas = await getMetas()
    const currentTime = new Date()
    const startHour = currentTime.getHours()
    const metasObj = metasByRegion(metas)
    for (region in metasObj) {
      const events = metasObj[region]
      let offset = 0

      const html = []
      events.forEach(meta => {
        // Limpiar vacíos
        meta.segments = meta.segments.filter(s => !s || !s.name)
        console.log(meta.segments)
        let current = meta.segments[0]
        let next = meta.segments[1]
        meta.segments.forEach(function (phase, phaseIndex) {
          let correctedTime = "" + (startHour + (offset > 59 ? 1 : 0))
          const hour = ("00" + correctedTime).slice(-2)
          const minute = ("00" + (offset % 60)).slice(-2)
          offset += phase.durationInMinutes;
          if (notPassed(hour, minute)) {
            next = phase
            current = phaseIndex >= 0 ? meta.segments[phaseIndex - 1] : meta.segments[meta.segments.length - 1]
            next.time = `${hour}:${minute}`
            console.log(hour, minute)
          }
        })
        html.push(getMetaHtml(current, next))
      })
      document.querySelector('#content').innerHTML += html.join('')
    }
  }

  await printMetas()

})()