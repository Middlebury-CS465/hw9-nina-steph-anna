library(tidyverse)
opiods <- read_csv("Senior Fall/CS465/opiods.csv")
opiods <- opiods %>% mutate(total_deaths = `2013`+`2014`+`2015`+`2016`+`2017`)
populations <- read_csv("Senior Fall/CS465/populations.csv")

joined <- left_join(opiods, populations, by=c("Residence"="City"))

# write_csv(joined, "Senior Fall/CS465/opiods_joined.csv")
opiods_joined <- read_csv("Senior Fall/CS465/opiods_joined.csv") %>% select(-`Massachusetts Cities by Population Rank`)

opiods_tidy <- opiods_joined %>% gather("year","deaths",2:6)
opiods_tidy %>% View()
opiods_tidy <- opiods_tidy %>% mutate(total_deaths_pc = total_deaths/Population, deaths_pc = deaths/Population)
opiods_tidy %>% arrange(desc(total_deaths_pc)) %>% filter(Population > 10000) %>% View()

prescriptionnumbers <- read_csv("Senior Fall/CS465/final/prescriptionnumbers.csv")
by_race <- read_csv("Senior Fall/CS465/final/deathsbyrace.csv")
by_county <- read_csv("Senior Fall/CS465/final/deathsbycounty.csv")
by_age <- read_csv("Senior Fall/CS465/final/deathsbyage.csv")
by_gender <- read_csv("Senior Fall/CS465/final/deathsbygender.csv")

county_prescript <- left_join(by_county, prescriptionnumbers, by = "County") %>% mutate(deaths_pc = Total/Population)


time_graph <- opiods_tidy %>% ggplot(aes(x = as.numeric(year), y = deaths, col = Residence)) + geom_line()
ggplotly(time_graph)

county_prescript %>% ggplot(aes(x = `%ofIndividualsReceivingScheduleIIOpioidPrescription`, 
                                y = deaths_pc)) + geom_point()
scripts_v_deaths <- county_prescript %>% 
  ggplot(aes(x = TotalScheduleIIOpioidPrescriptions, 
                                y = Total)) + 
  geom_point() + 
  ylim(c(0, 4000)) +
  ylab("total deaths") +
  geom_smooth(method='lm', formula=y~x)
scripts_v_deaths
ggplotly(scripts_v_deaths)
