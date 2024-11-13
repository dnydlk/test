class enen_LDOCE {
  constructor(options) {
    this.options = options || {}
    this.maxExamples = this.options.maxExamples || 2
  }

  async findTerm(word) {
    const url = `https://www.ldoceonline.com/dictionary/${encodeURIComponent(
      word
    )}`

    // Fetch HTML content
    let response
    try {
      response = await fetch(url)
    } catch (error) {
      console.error("Error fetching the page:", error)
      return []
    }

    const htmlText = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlText, "text/html")

    const results = []

    // Find the main dictionary entry container
    const dictionary = doc.querySelector(".dictionary")
    if (!dictionary) return results

    // Get the word expression, pronunciation, and frequency level
    const expression = dictionary.querySelector(".HWD")?.innerText || ""
    const pronunciation = dictionary.querySelector(".PRON")?.innerText || ""

    // Get audio links if available
    const audioElements = dictionary.querySelectorAll(".speaker")
    const audioUrls = Array.from(audioElements).map((el) =>
      el.getAttribute("data-src-mp3")
    )

    // Get definitions and example sentences
    const definitions = []
    const senses = dictionary.querySelectorAll(".Sense")

    for (let sense of senses) {
      const definition = sense.querySelector(".DEF")?.innerText || ""
      if (!definition) continue

      // Get examples if available
      const examples = []
      const exampleElements = sense.querySelectorAll(".EXAMPLE")
      exampleElements.forEach((exEl, index) => {
        if (index < this.maxExamples) {
          examples.push(exEl.innerText.trim())
        }
      })

      definitions.push({
        definition,
        examples,
      })
    }

    results.push({
      expression,
      pronunciation,
      audioUrls,
      definitions,
    })

    return results
  }
}
