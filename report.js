const core = require('@actions/core')
const table = require('markdown-table')
const replaceComment = require('@aki77/actions-replace-comment')
const path = require('path')
const github = require('@actions/github')

const report = async function (json) {
  const groups = json.groups || []

  const header = [
    'group name',
    'covered percent',
    'covered lines',
    'lines of code'
  ]

  const metrics = [
    'Total',
    textColor(json.metrics.covered_percent.toFixed(2)),
    json.metrics.covered_lines,
    json.metrics.total_lines
  ]

  const groupRows = groups.map((group) => {
    return [
      group.group_name,
      textColor(group.covered_percent.toFixed(2)),
      group.covered_lines,
      group.lines_of_code
    ]
  })

  const tableText = table([header, metrics, ...groupRows])

  const pullRequestId = github.context.issue.number
  if (pullRequestId) {
    await replaceComment.default({
      token: core.getInput('token', { required: true }),
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: pullRequestId,
      body: `## Simplecov Coverage
${tableText}
`
    })
  }

  return true
}

const textColor = function (percentage) {
  percentage = parseFloat(percentage);
  if(percentage === 0.00) {
    return "$\\textcolor{red}{\\textsf{" + percentage.toFixed(0) + "}}$ %"
  } else if(percentage < 80) {
    return "$\\textcolor{red}{\\textsf{" + percentage + "}}$ %"
  } else if(percentage < 100) {
    return "$\\textcolor{orange}{\\textsf{" + percentage + " %}}$ %"
  } else if (percentage === 100.00) {
    return "$\\textcolor{green}{\\textsf{" + percentage.toFixed(0) + " %}}$ %"
  }
}

module.exports = report
