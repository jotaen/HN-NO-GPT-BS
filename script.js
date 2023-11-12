const config = {
	// Block elements that match any of these conditions.
	blocked: {
		originURLs: ["openai.com"],
		originWords: ["GPT"],
		titleWords: ["GPT", "OpenAI"],
	},

	// Refrain from blocking if any of these conditions apply.
	exceptions: {
		pointsThreshold: 10,
		commentThreshold: 10,
	},

	// Callback that will be applied to all matching submissions.
	handle: el => el.style.display = "none",
}

const eligibleElements = [
	{
		description: "Origin URL is blocked",
		predicate: titleEl => config.blocked.originURLs.find(url => url === titleEl.querySelector(".sitestr")?.innerText),
	}, {
		description: "URL contains blocked word",
		predicate: titleEl => config.blocked.originWords.find(word => titleEl.querySelector(".sitestr")?.innerText.toLowerCase().includes(word.toLowerCase())),
	}, {
		description: "Title contains blocked word",
		predicate: titleEl => config.blocked.titleWords.find(word => titleEl.querySelector(".titleline a").innerText.toLowerCase().includes(word.toLowerCase())),
	},
]

const exceptions = [
	{
		description: "It’s above points threshold",
		predicate: sublineEl => parseInt(sublineEl.querySelector(".score")?.innerText) > config.exceptions.pointsThreshold,
	}, {
		description: "It’s above comment threshold",
		predicate: sublineEl => parseInt(sublineEl.querySelector(".subline")?.childNodes[11]?.innerText) > config.exceptions.commentThreshold,
	},
]

document.querySelectorAll("tr.athing").forEach(titleEl => {
	const sublineEl = titleEl.nextSibling

	const eligible = eligibleElements.find(x => x.predicate(titleEl))
	const exception = exceptions.find(x => x.predicate(sublineEl))

	if (!eligible) {
		return
	}

	const title = titleEl.querySelector(".titleline a").innerText
	if (exception) {
		console.log(`[HN-NO-GPT-BS] Keep "${title}": ${exception.description}`)
	} else {
		console.log(`[HN-NO-GPT-BS] Hide "${title}": ${eligible.description}`)
		const elIndex = Array.prototype.indexOf.call(titleEl.parentNode.childNodes, titleEl)
		;[0 /*title*/, 1/*subline*/, /*2=void text node*/, 3/*spacer*/].forEach(i => {
			config.handle(titleEl.parentNode.childNodes[elIndex+i])
		})
	}
})
