(async () => {

  const getMetas = async () => {
    const res = await fetch('https://raw.githubusercontent.com/DanielScholte/GuildWars2Companion/master/assets/data/event_timers/meta_events.json')
    const metas = await res.json()
    console.log(metas)
    return metas
  }

  const getMetaHtml = data => `<div class="meta-container">
    <p class="current"></p>
    <p class="next"></p>
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
    console.log(metas)
    const metasObj = metasByRegion(metas)
    for (region in metasObj) {
      const regions = metasObj[region]
      let offset = 0
      // console.log(`\n\n ${color(region, 'Bright')}`)
      // console.log('═'.repeat(totalWidth))
      regions.forEach(meta => {
        const totalTime = meta.segments.reduce((acc, p) => acc += p.duration, 0)
        // console.log(`\n ${color(meta.name, 'Bright')}`)
        let current = null
        let next = null
        meta.phases.forEach(function (phase, phaseIndex) {
          let correctedTime = "" + (startHour + (offset > 59 ? 1 : 0))
          const hour = ("00" + correctedTime).slice(-2)
          const minute = ("00" + (offset % 60)).slice(-2)
          offset += phase.duration;
          if (phase.name && notPassed(correctedTime, offset % 60)) {
            console.log(phase.name, correctedTime, offset % 60)
            // console.log(color(' ██', `Fg${phase.color}`), `${phase.name}: ${hour}:${minute} - ${formatDate(+hour, +minute + +phase.duration)} (${phase.duration}')`)
          }
        })
      })
    }
  }

  await printMetas()

})()