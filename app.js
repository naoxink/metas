(async () => {

  const getMetas = async () => {
    const res = await fetch('https://raw.githubusercontent.com/DanielScholte/GuildWars2Companion/master/assets/data/event_timers/meta_events.json')
    const metas = await res.json()
    return metas
  }

  const getMetaHtml = (mapName, current, next) => `<div class="meta-container">
    <p><strong>${mapName}</strong></p>
    <p class="current">
      ${current && current.name ? current.name : ''}<br>
      <small>Started at: ${current && current.time ? current.time : ''}</small>
    </p>
    <p class="next">
      ${next && next.name ? next.name : ''}<br>
      <small>Starts at: ${next && next.time ? next.time : ''}</small>
    </p>
  </div>`;

  const getRegionContainer = (title, innerHTML) => `<div class="region">
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

  const passed = (hour, minute) => {
    const currentTime = new Date()
    return +hour > currentTime.getHours() || (+hour === currentTime.getHours() && +minute > currentTime.getMinutes())
  }

  const printMetas = async () => {
    const metas = await getMetas()
    const currentTime = new Date()
    const startHour = currentTime.getHours()
    const metasObj = metasByRegion(metas)
    const regionsHtml = []
    for (region in metasObj) {
      const maps = metasObj[region]

      const html = []
      maps.forEach(map => {
        let offset = 0
        // if (map.offsetInMinutes) {
        //   offset += map.offsetInMinutes
        // }

        // Rellenar nombre de vacíos
        map.segments = map.segments.map(s => {
          if (!s.name) {
            s.name = '- Standby -'
          }
          return s
        })

        let current = map.segments[0]
        let next = null // map.segments[1]
        map.segments.forEach(function (phase, phaseIndex) {
          let correctedTime = "" + (startHour + (offset > 59 ? 1 : 0))
          const hour = ("00" + correctedTime).slice(-2)
          const minute = ("00" + (offset % 60)).slice(-2)
          console.log(`${phase.name} @ ${hour}:${minute} | duration: ${phase.durationInMinutes} | offset: ${offset}`)
          offset += phase.durationInMinutes
          if (!passed(hour, minute)) {
            current = phase
            current.time = `${hour}:${minute}`

            next = phaseIndex === map.segments.length - 1 ? map.segments[0] : map.segments[phaseIndex + 1]
            const nextOffset = offset
            const nextHour = ("00" + (startHour + (nextOffset > 59 ? 1 : 0))).slice(-2)
            const nextMinute = ("00" + nextOffset % 60).slice(-2)
            next.time = `${nextHour}:${nextMinute}`
          }
        })
        html.push(getMetaHtml(map.name, current, next))
      })
      regionsHtml.push(getRegionContainer(region, html.join('')))
    }
    document.querySelector('#content').innerHTML = regionsHtml.join('')
    // setTimeout(printMetas, 1000)
  }

  await printMetas()

})()