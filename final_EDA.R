library(tidyverse)
library(plotly)
opiods <- read_csv("final/opiods.csv")
opiods <- opiods %>% mutate(total_deaths = `2013`+`2014`+`2015`+`2016`+`2017`)
populations <- read_csv("Senior Fall/CS465/populations.csv")

joined <- left_join(opiods, populations, by=c("Residence"="City"))

# write_csv(joined, "Senior Fall/CS465/opiods_joined.csv")
opiods_joined <- read_csv("Senior Fall/CS465/opiods_joined.csv") %>% select(-`Massachusetts Cities by Population Rank`)

opiods_tidy <- opiods_joined %>% gather("year","deaths",2:6)
opiods_tidy %>% View()
opiods_tidy <- opiods_tidy %>% mutate(total_deaths_pc = total_deaths/Population, deaths_pc = deaths/Population)
opiods_tidy %>% arrange(desc(total_deaths_pc)) %>% filter(Population > 10000) %>% View()

# prescriptionnumbers <- read_csv("Senior Fall/CS465/final/prescriptionnumbers.csv")
prescriptionnumbers<- read_csv("Senior Fall/CS465/prescriptionnumbers.csv")
deathsbycounty <- read_csv("Senior Fall/CS465/deathsbycounty.csv")
by_race <- read_csv("Senior Fall/CS465/hw9-nina-steph-anna/final/deathsbyrace.csv")
by_county <- read_csv("Senior Fall/CS465/final/deathsbycounty.csv")
by_age <- read_csv("Senior Fall/CS465/final/deathsbyage.csv")
by_gender <- read_csv("Senior Fall/CS465/final/deathsbygender.csv")

county_prescript_wide <- left_join(deathsbycounty, prescriptionnumbers, by = "County") %>% mutate(deaths_pc = Total/Population)

county_prescript_wide <- county_prescript_wide %>% filter(County != "Total,Deaths")

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
reg <- lm(Total~TotalScheduleIIOpioidPrescriptions, county_prescript)
summary(reg)
ggplotly(scripts_v_deaths)


county_prescript <- county_prescript_wide %>% gather("year","deaths",2:19)
county_prescript_clean <- county_prescript %>% select(1:4, deaths_pc, year, deaths) %>% 
  rename(TotalPrescriptions =  TotalScheduleIIOpioidPrescriptions, 
         DeathsPerCapita = deaths_pc,
         TotalDeathsAllYears = Total,
         Year = year,
         Deaths = deaths) %>%
  select(County, Year, Deaths, DeathsPerCapita, TotalDeathsAllYears, TotalPrescriptions, Population) %>% 
  mutate(TotalDeathsPerCapita = TotalDeathsAllYears/Population)

county_prescript_clean %>% View()

write_csv(county_prescript_clean, "county_deaths.csv")

county_deaths <- county_deaths %>% mutate(DeathsPerCapita = Deaths/Population)
write_csv(county_deaths, "Senior Fall/CS465/hw9-nina-steph-anna/county_deaths.csv")

county_deaths %>% ggplot(aes(x= TotalPrescriptions, y = TotalDeathsAllYears)) + geom_point() + geom_smooth(method = "lm")
