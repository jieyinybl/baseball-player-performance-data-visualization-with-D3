# Effect of Handedness, Weight and Height on Batting Average and Homeruns

## Summary 
This project is about whether or not batters handedness, weight or height have an effect on batting average and homeruns of baseball batters. On one hand, the charts show that there is some correlation between the factors above and the performance of baseball batters: Left handed batters have an advantage on batting average and homeruns over their right handed or both handed counterparts; Smaller batters with less weight and height perform better in terms of batting average than batters who are taller and heavier. On the other hand, the correlation between homeruns and weight / height is relatively weak, which indicates that the homeruns could be influenced by a combination of different factors.

## Usage
This project does work not outside a http server. To start a local http server, please follow those steps:

- `npm install --global http-server`
- `cd <PROJECT_DIRECTORY>`
- `http-server ./`

You can choose a http server of your choice, of course.

## Design 
- Line chart for visualization of the relationship between weight / height and batting average / homeruns
	- As the variable of weight / height is continuous, it will be first grouped into different weight / height classes
- Less is more and using average value for comparison between different categories / classes
	- The main purpose in the visualization is to define whether handedness, weight or height has an effect over performance of baseball player. In order to define an overall trend / patterns, single data point will not be plotted on the charts. Instead, an average value of batting average and homeruns will be calculated.
- Data Inspection and Cleaning (after Feedback 1)
	- The raw data contains performance of 1157 baseball batters, where 266 out of them have 0% batting average. The reason could be that the 266 batters have never batted. In order to avoid that the non-attended players data point influencing the visualization, a avgNonZero filter will be applied to each chart to filter out the data points where the batting average is equal to 0%.
	- To show the difference, a storyboard animation is used to show the data filtered and pure
- Using quantiles for weight and height (after Feedback 2)
    - The weight and height is not evenly distributed among the players (e.g. there is only one player with weight > 240 lbs), therefore quantiles are used to calculate the average of groups with the same size.
    - To display the charts before the use of quantiles just add the query parameter `linear-scale` e.g. http://localhost:8080/?linear-scale
    - this solves also the problem mentioned in Feedback 3


## Feedback 
1. "Looking at the data, there are a lot of entries which have a battering average of zero. It is most likely, that those players have never played a match. Those entries can have a big influence on the statistics."
2. "The weight and height of the players is not evenly distributed. So maybe use a quantilized category axis."
3. "There seem to be extreme values, e.g. there is only one player above 240 lbs and has a big influence on the chart. Maybe clean up some data."

## Resources 
1. https://github.com/PMSI-AlignAlytics/dimple/wiki
2. https://github.com/d3/d3/blob/master/API.md
