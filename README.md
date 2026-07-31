# PlastiFind Hub

Build a complete responsive web application called PlastiFind OS, designed as the internal operating system and digital headquarters of an environmental robotics startup.

1. Product context

Company

PlastiFind

First product

Labi-Bot

Company positioning

PlastiFind develops autonomous AI-powered robotics solutions for environmental protection, waste management, public-space cleanliness and future smart-city applications.

First product: Labi-Bot

Labi-Bot is an autonomous environmental robot designed to:

detect waste using computer vision and artificial intelligence

navigate autonomously

collect waste from beaches and public spaces

store collected waste onboard

detect littering events through a dedicated monitoring mode

capture photographic evidence after a detected littering event

send event information to a private local dashboard for authorized review

operate using edge AI and local processing where possible

support municipalities, environmental organizations, resorts, cleaning operators and smart-city programs

The previous Labi-Bot prototype won first place at Robofest Tunisia and second place internationally at Robofest in Michigan, United States. The first prototype was later sold. The current objective is to build a new generation, create the French startup and prepare funding, pilot projects and commercialization.

2. Main goal of the application

The application must centralize everything required to build and manage PlastiFind:

company strategy

product development

engineering documentation

tasks and project management

roadmap and milestones

funding applications

finance and expenses

customer and partner CRM

meetings and decisions

legal documents

intellectual-property tracking

media and brand assets

startup competitions

university commitments

founder priorities

team recruitment

metrics and progress

The application should feel like a combination of:

Notion

Linear

Jira

HubSpot

a lightweight ERP

a startup founder dashboard

an engineering knowledge base

Do not make it look like a basic admin template.

It must feel like the private internal software of a serious robotics startup.



3. Brand identity and design system

Brand name

PlastiFind

Product name

Labi-Bot

Visual direction

Modern, premium, technical and environmentally focused.

Use a visual language inspired by:

modern robotics companies

clean aerospace dashboards

premium SaaS products

environmental technology

industrial design

Style

minimalist

polished

high contrast

professional

technical

spacious

modular

data-oriented

suitable for daily use

Primary colors

Use the existing PlastiFind blue as the main brand color.

Suggested palette:

Primary blue: #35A9E0

Deep navy: #081A2B

Dark surface: #0E2235

Light background: #F5F8FA

Green accent: #3CCB8E

Warning amber: #F4B740

Danger red: #EF5B5B

Muted gray: #7B8A97

White: #FFFFFF

Theme

Support both:

dark mode

light mode

Dark mode should be the default.

Typography

Use a clean modern sans-serif such as Inter.

Use:

strong headings

readable data tables

medium-weight labels

compact metadata

clear hierarchy

Logo

Create a placeholder component for the PlastiFind logo in the sidebar and login page.

Allow the administrator to upload or replace:

company logo

favicon

dashboard cover image

Labi-Bot product images

UI details

Use:

rounded cards

subtle shadows

thin borders

clear hover states

status chips

progress bars

avatars

clean data tables

filters

searchable lists

kanban boards

timelines

responsive charts

modal forms

drawers for quick editing

command palette

toast notifications

empty states with useful calls to action

skeleton loading states

polished form validation

Avoid excessive gradients and unnecessary animation.



4. Application structure

Create a persistent left sidebar with these modules:

Dashboard

Company

Products

Engineering

Projects

Tasks

Roadmap

Business

CRM

Funding

Finance

Meetings

Team

Marketing

Media

Achievements

Research

Documents

Legal and IP

Competitions

University

Settings

The sidebar should be collapsible.

Add:

top search bar

global command palette

quick-create button

notifications

current user menu

dark/light theme toggle



5. Authentication and user roles

Create a functional authentication flow.

Login screen

Include:

PlastiFind logo

email

password

forgot-password link

sign-in button

optional Google authentication placeholder

background image or subtle robotics/environment visual

Roles

Founder / Admin

Full access to all modules.

Engineering member

Access to:

products

engineering

projects

tasks

research

documents

meetings

Business member

Access to:

business

CRM

funding

finance

marketing

meetings

documents

Mentor / Advisor

Read access to selected pages and comments.

Viewer

Read-only access to assigned content.

Include role-based permissions in the architecture even if the first version uses one admin account.



6. Dashboard

Create a premium founder dashboard called PlastiFind HQ.

Header

Display:

“Bonjour Cheith”

current date

company stage

current startup objective

quick actions

Quick actions

Buttons for:

Add task

Add funding opportunity

Add meeting

Add expense

Add contact

Add research note

Upload document

Add product milestone

Key cards

Current objective

Example:

“Créer juridiquement PlastiFind et préparer le financement de Labi-Bot V2.”

Countdown

Show days remaining until the next major milestone.

Example milestones:

SNEE committee interview

startup registration target

funding deadline

prototype-design deadline

first pilot meeting

Startup launch progress

Show a weighted progress percentage based on:

legal preparation

branding

business plan

pitch deck

website

funding dossier

product specification

customer discovery

Product progress

Labi-Bot V2 progress bar by category:

mechanical

electronics

embedded systems

AI and computer vision

autonomous navigation

web dashboard

testing

industrialization

Funding pipeline

Display:

opportunities identified

applications in preparation

submitted applications

accepted

rejected

total potential amount

funding received

Financial overview

Display:

available cash

monthly expenses

committed costs

estimated prototype budget

funding gap

Priority tasks

List the highest-priority tasks with:

status

assignee

deadline

project

urgency

Upcoming meetings

List next meetings with:

date

organization

participants

purpose

preparation status

Recent activity

Show:

updated tasks

uploaded documents

funding status changes

meeting notes

engineering decisions

KPI cards

Include:

prototypes built

products sold

pilot customers

active contacts

funding applications

total funding target

media mentions

competition awards

Dashboard charts

Include:

tasks by status

spending by category

funding pipeline

roadmap progress

product development progress



7. Company module

Create a company profile page for PlastiFind.

Sections

Company identity

Fields:

legal company name

commercial name

tagline

logo

company status

creation date

legal structure

SIREN

SIRET

registered address

website

professional email

phone

LinkedIn

Instagram

GitHub

Use placeholders until the company is officially registered.

Mission

Default content:

“Développer des solutions robotiques autonomes utilisant l’intelligence artificielle pour protéger l’environnement et améliorer la gestion des espaces publics.”

Vision

Default content:

“Faire de PlastiFind une entreprise européenne de référence dans la robotique environnementale et les solutions autonomes pour les villes intelligentes.”

Values

Use cards for:

Sustainability

Innovation

Real-world impact

Reliability

Privacy

Responsible AI

Accessibility

Collaboration

Founder story

Create an editable founder story covering:

previous robotics competitions

Eurobot experience

Forum DSI experience

Robofest Tunisia first place

international Robofest second place

first prototype sold

move to France

studies at UBO

ambition to create the startup in Brest

Company timeline

Display milestones chronologically.

Strategic objectives

Create editable one-year, three-year and five-year goals.

Brand assets

Upload and organize:

logos

color codes

fonts

pitch visuals

social-media templates

product photos

presentation covers



8. Products module

Create a product database.

Each product has:

name

code name

category

status

description

target users

product owner

stage

progress

estimated cost

target price

expected launch

images

technical documents

related projects

related tasks

related risks

related milestones

Preload the first product:

Labi-Bot

Product summary

Autonomous environmental robot using AI, computer vision and robotics to detect and collect litter, monitor littering events and provide environmental data through a private dashboard.

Current stage

Validated proof of concept / preparing V2.

Target customers

municipalities

coastal authorities

beach managers

resorts and hotels

cleaning companies

environmental organizations

universities

smart-city programs

industrial sites with outdoor waste-management needs

Main operating modes

Cleaning mode

detect waste

classify target objects

navigate toward waste

collect waste

avoid obstacles

store collected waste

monitor storage capacity

Monitoring mode

detect a person holding waste

detect the littering gesture

confirm contextual disappearance of the waste

trigger an audio warning

capture an event image

store date and time

send event to a local web dashboard

allow authorized human review

Include a clear privacy note:

“The monitoring mode must be designed in compliance with GDPR, privacy-by-design principles and applicable rules regarding image capture in public spaces. The system should support local processing, limited retention, controlled access and human review.”

Labi-Bot page tabs

Overview

Customer problem

Product features

Technical architecture

Mechanical

Electronics

AI and computer vision

Software

Dashboard

Bill of materials

Costs

Tests

Risks

Product roadmap

Documents

Media

Decisions

Version history



9. Engineering module

Create an engineering knowledge base for robotics development.

Engineering disciplines

Mechanical design

Electronics

Power systems

Embedded systems

AI and computer vision

Autonomous navigation

Web application

Mobile control

Manufacturing

Testing and validation

Safety

Cybersecurity

Privacy

Engineering document types

specification

architecture

experiment

test report

design decision

bug

risk

lesson learned

component datasheet

integration guide

assembly guide

Each engineering record should include:

title

product

category

status

author

date

version

related component

related requirement

related project

files

notes

decision

test result

Requirements database

Fields:

requirement ID

title

category

description

priority

source

verification method

status

related tests

related component

version

Examples:

ENV-001: operate on sand

NAV-001: detect obstacles

AI-001: detect target waste in real time

PWR-001: minimum operating autonomy

SAF-001: emergency stop

WEB-001: local secure dashboard

PRIV-001: restricted access to monitoring events

Components database

Fields:

component name

category

supplier

reference

quantity

unit price

total price

weight

power consumption

availability

lead time

status

alternative component

datasheet

product version

Preload example categories:

Jetson computer

Arduino controller

motors

motor drivers

cameras

ultrasonic sensors

batteries

wheels

servos

chassis

wiring

power regulators

Tests database

Fields:

test ID

title

product

version

requirement

environment

procedure

expected result

actual result

status

date

evidence

responsible person

notes

Risks database

Fields:

risk

category

probability

impact

score

mitigation

owner

status

review date

Include example risks:

poor traction on sand

water exposure

battery overheating

false littering detection

privacy non-compliance

expensive manufacturing cost

component shortage

unstable navigation

insufficient runtime

mechanical blockage

Decision log

Track important design decisions:

decision

date

context

alternatives

chosen option

rationale

consequences

owner



10. Projects module

Create a project portfolio.

Each project includes:

project name

objective

product

owner

team

status

priority

start date

target date

progress

budget

tasks

milestones

risks

documents

meetings

Preload projects:

PlastiFind company creation

SNEE application

Labi-Bot V2 specification

Funding dossier

Startup website

Pitch deck

Business plan

Customer discovery

Legal and immigration verification

Brand launch

Prototype V2 development

Pilot-customer acquisition

Project statuses:

Idea

Planned

In progress

Blocked

Review

Completed

Cancelled

Views:

card grid

list

timeline

by status

by priority



11. Tasks module

Create a comprehensive task manager.

Fields:

task name

description

status

priority

deadline

assignee

project

product

category

estimated effort

actual effort

dependencies

attachments

checklist

notes

Statuses:

Backlog

To do

In progress

Waiting

Review

Done

Cancelled

Priorities:

Critical

High

Medium

Low

Views:

Today

This week

Overdue

Kanban

By project

By assignee

Calendar

Completed

Allow:

drag-and-drop

bulk edit

recurring tasks

subtasks

comments

attachments



12. Roadmap module

Create a visual company roadmap.

Roadmap categories

Company

Product

Engineering

Funding

Sales

Marketing

Legal

Team

Competitions

University

Timeline horizons

30 days

90 days

12 months

3 years

Preload near-term milestones:

complete SNEE committee interview

finalize PlastiFind identity

validate legal path for company creation

select legal structure

complete business plan

complete pitch deck

finish funding dossier

create website

register domain

prepare Labi-Bot V2 specifications

estimate prototype budget

identify pilot municipalities

submit first funding application

create PlastiFind company

recruit initial contributors

begin V2 development

Each milestone includes:

title

category

date

status

progress

owner

dependencies

evidence

related project



13. Business module

Create editable startup-strategy tools.

Business Model Canvas

Include sections for:

customer segments

value propositions

channels

customer relationships

revenue streams

key resources

key activities

key partners

cost structure

Lean Canvas

Include:

problem

customer segments

unique value proposition

solution

channels

revenue streams

cost structure

key metrics

unfair advantage

SWOT analysis

Interactive four-quadrant view.

Suggested initial content:

Strengths

working prototype history

national and international awards

founder robotics experience

first prototype sold

clear environmental mission

AI and robotics integration

Weaknesses

no current prototype

limited initial funding

founder still studying

hardware development costs

small current team

incomplete industrialization

Opportunities

smart cities

environmental regulation

coastal cleanup

green innovation grants

municipal automation

growing robotics market

tourism and resort partnerships

Threats

expensive hardware

regulatory/privacy constraints

established competitors

long municipal sales cycles

maintenance requirements

manufacturing complexity

Competitor database

Fields:

company

country

product

customer segment

technology

price

strengths

weaknesses

website

notes

Customer personas

Create templates for:

municipality operations manager

beach-management authority

hotel or resort director

cleaning-service company

environmental NGO

university or research institution

Pricing strategy

Track:

product purchase price

leasing price

subscription

maintenance contract

dashboard license

installation

training

custom development

Revenue models

Support:

robot sale

robot leasing

maintenance subscription

software subscription

data/reporting service

pilot-project contract

customization

public procurement



14. CRM module

Create a CRM for:

customers

pilot partners

municipalities

sponsors

investors

incubators

mentors

suppliers

universities

media

Contact fields

person

organization

role

email

phone

LinkedIn

category

stage

last interaction

next action

owner

notes

related meetings

related opportunities

Pipeline stages

Identified

Contact planned

Contacted

Meeting scheduled

Qualified

Proposal

Negotiation

Pilot

Partner

Lost

Organization fields

organization name

type

city

country

website

estimated relevance

relationship

contacts

meetings

opportunities



15. Funding module

Create a grant and funding tracker.

Funding opportunity fields

program name

organization

type

amount

minimum amount

maximum amount

repayment required

equity required

deadline

eligibility

company required

prototype required

region

link

status

probability

next action

documents required

owner

notes

Funding types

grant

competition prize

equity investment

loan

sponsorship

equipment support

incubation

university support

European program

Statuses

Research

Eligible

Not eligible

To prepare

Draft

Submitted

Interview

Accepted

Rejected

On hold

Application checklist

For each opportunity:

executive summary

pitch deck

business plan

budget

technical dossier

founder CV

certificates

proof of awards

proof of sale

company documents

bank details

letters of support

Funding dashboard

Display:

total target

submitted amount

potential amount

accepted amount

deadlines in next 30 days

completion percentage by application



16. Finance module

Create simple startup financial management.

Expenses

Fields:

date

category

supplier

description

amount

tax

payment method

project

product

receipt

reimbursable

status

Categories:

components

manufacturing

software

legal

accounting

marketing

travel

competitions

insurance

office

prototyping

subscriptions

Budget

Track:

planned budget

actual spending

remaining budget

funding source

project

period

Prototype-cost calculator

Create a BOM-based estimated prototype cost.

Display:

mechanical cost

electronics cost

computing cost

sensors

power system

manufacturing

assembly

testing

contingency

total

Revenue forecast

Allow simple monthly and yearly projections for:

robot sales

leasing

maintenance

software subscriptions

pilots

grants



17. Meetings module

Create structured meeting notes.

Fields:

title

date

organization

participants

meeting type

objective

agenda

notes

decisions

action items

next meeting

files

related contact

related project

Meeting types:

mentor

investor

funding

customer

supplier

team

university

legal

technical review

competition

Create a meeting template with:

Context

Objectives

Questions

Discussion notes

Decisions

Action items

Deadlines

Follow-up email



18. Team module

Create a team and hiring database.

Member fields

name

role

department

email

phone

status

start date

skills

availability

projects

tasks

documents

notes

Departments

Founder

Mechanical

Electronics

Embedded

AI

Software

Business

Marketing

Finance

Legal

Hiring pipeline

Statuses:

Role planned

Candidate identified

Contacted

Interview

Trial project

Offer

Joined

Rejected

Preload potential future roles:

mechanical engineer

embedded-systems engineer

electronics engineer

AI and computer-vision engineer

autonomous-navigation engineer

frontend developer

backend developer

business developer

public-sector sales specialist

industrial designer



19. Marketing module

Create:

content calendar

campaign tracker

social-media posts

website content

press outreach

event participation

brand messaging

Content calendar fields

title

platform

format

date

status

objective

product

media

caption

link

metrics

Platforms:

LinkedIn

Instagram

Facebook

TikTok

YouTube

Website

Press

Brand messages

Include:

Short description

“PlastiFind développe des solutions robotiques autonomes utilisant l’intelligence artificielle pour protéger l’environnement et améliorer la gestion des espaces publics.”

Labi-Bot product line

“Labi-Bot détecte, collecte et analyse les déchets grâce à la robotique autonome et à la vision par ordinateur.”

Company tagline options

Finding waste. Protecting nature.

La robotique au service d’un environnement plus propre.

Des robots intelligents pour des espaces plus propres.

Autonomous robotics for a cleaner world.



20. Media module

Create a media library with gallery view.

Categories:

Labi-Bot product

beach testing

assembly

manufacturing

electronics

AI dashboard

competitions

awards

founder

team

CAD renders

press

logo and branding

Each asset includes:

title

category

date

description

usage rights

source

tags

related product

file

public/private status



21. Achievements module

Create a timeline and database.

Fields:

achievement

date

category

event

location

result

product

evidence

description

Preload:

Eurobot 2023 experience — separate robotics project

Eurobot 2024 experience — separate robotics project

Forum DSI 10th edition — early bottle-collection concept

Robofest Tunisia 2025 — Labi-Bot, first place

International Robofest 2025, Michigan — Labi-Bot, second place

First Labi-Bot prototype sold

SNEE application submitted

Clearly distinguish Eurobot projects from Labi-Bot.



22. Research module

Create a searchable knowledge base.

Research categories:

beach-cleaning robotics

waste detection

computer vision

YOLO models

pose estimation

human-action recognition

edge AI

autonomous navigation

battery systems

sand mobility

environmental regulation

public procurement

GDPR

smart cities

competitors

market research

manufacturing

Each research entry includes:

title

category

source

link

summary

key insight

relevance

product

tags

date

author

file



23. Documents module

Create a structured file library.

Categories:

pitch deck

business plan

executive summary

technical manual

product specification

financial forecast

funding application

legal

contracts

certificates

competition documents

marketing

invoices

insurance

immigration

university

Each document includes:

title

category

version

status

owner

creation date

update date

confidentiality level

related project

related product

file

notes

Confidentiality:

Public

Internal

Confidential

Restricted



24. Legal and intellectual-property module

Create checklists and document trackers.

Company creation checklist

verify residence-permit compatibility

choose legal structure

choose company name

verify name availability

define activity

determine share capital

choose registered address

draft statutes

deposit share capital

publish legal announcement

submit registration

receive SIREN/SIRET

obtain Kbis

open professional account

arrange insurance

appoint accountant

Do not present legal guidance as guaranteed legal advice. Add a disclaimer recommending confirmation with Pépite, a qualified legal professional and the relevant administration.

IP tracker

Track:

invention

author

date

ownership

collaborators

disclosure status

confidentiality

possible patent

trademark

design protection

software copyright

next action

Data and privacy checklist

Especially for monitoring mode:

legal basis

image capture rules

data minimization

retention period

access control

encryption

local processing

audit log

human review

signage/information

DPIA requirement

CNIL consultation where appropriate



25. Competitions module

Create a competition tracker.

Fields:

competition

organization

category

location

date

registration deadline

eligibility

cost

status

team

robot

objectives

documents

travel

result

Include possible future entries:

Eurobot 2027

Robofest 2027

startup competitions

green-tech challenges

student-entrepreneur competitions



26. University module

The founder is studying at UBO, so include a university-planning area.

Create:

courses

exams

assignments

timetable

university deadlines

SNEE actions

entrepreneurship appointments

study/startup workload planner

Workload view

Show weekly time allocation:

university

startup

health

administration

personal

Add a warning if startup workload becomes unrealistic during exam periods.



27. Settings module

Include:

company profile

user management

roles and permissions

branding

theme

notification preferences

data export

language

currency

date format

integrations

security

backups

Languages

Support:

French

English

French should be the default application language.

Currency

Default to EUR.



28. Search and command palette

Add a global command palette activated with:

Cmd + K on Mac

Ctrl + K on Windows

Commands:

create task

create meeting

add contact

add funding opportunity

add expense

upload document

open product

search engineering records

switch theme

navigate to module

Global search should search across:

tasks

documents

contacts

projects

products

research

meetings

funding

engineering records



29. Notifications

Create an internal notification center.

Notify users about:

overdue tasks

funding deadlines

upcoming meetings

milestone delays

budget overruns

new comments

assigned tasks

document updates

expiring legal documents



30. Data and backend requirements

Use a real backend.

Preferred stack:

React

TypeScript

Tailwind CSS

shadcn/ui

Supabase

PostgreSQL

Supabase authentication

Supabase storage

Recharts for charts

responsive design

Create proper database tables for:

profiles

organizations

contacts

products

projects

tasks

milestones

funding opportunities

funding applications

expenses

budgets

meetings

meeting actions

documents

media

engineering records

requirements

components

tests

risks

decisions

achievements

research

team members

job roles

competitions

university items

notifications

Use relational connections, not duplicated static data.

Implement:

create

read

update

delete

filters

sorting

pagination

full-text search where practical

file uploads

role-based security

row-level security

responsive mobile interface



31. Demo data

Populate the application with realistic sample data for PlastiFind.

Include:

PlastiFind company profile

Labi-Bot product

SNEE application project

Labi-Bot V2 project

company-creation project

pitch-deck task

business-plan task

funding-dossier task

sample funding opportunities

sample municipalities

sample mentor meeting

example expenses

engineering risks

example BOM components

roadmap milestones

achievement timeline

Do not use “Lorem ipsum.”

Use meaningful French text related to PlastiFind.



32. Mobile experience

Make the application fully responsive.

On mobile:

use a bottom navigation for the main modules

make tables scrollable or convert to cards

preserve task creation

allow quick meeting notes

allow photo uploads

allow expense receipt uploads

keep dashboard readable

use touch-friendly controls



33. Empty states

Every empty module should explain:

what belongs there

why it matters

the first recommended action

Example:

“No funding opportunity yet. Add grants, competitions, sponsorships or investors to build your funding pipeline.”



34. Product quality requirements

The application must be:

visually coherent

responsive

functional

fast

polished

production-oriented

not a static mockup

not a one-page landing page

not a generic dashboard

not filled with placeholder lorem ipsum

All navigation links must work.

All main forms must work.

All tables and cards must support editing.

Create realistic loading, success and error states.

Use reusable components.



35. Initial homepage content

Use this French content on the main dashboard:

Header

PlastiFind HQ

La robotique autonome au service d’un environnement plus propre.

Current objective

Structurer PlastiFind, créer légalement l’entreprise et préparer le financement de Labi-Bot V2.

Company summary

PlastiFind développe des solutions robotiques autonomes utilisant l’intelligence artificielle pour détecter, collecter et analyser les déchets dans les espaces publics.

Product summary

Labi-Bot est le premier produit de PlastiFind. Il associe robotique autonome, vision par ordinateur, collecte des déchets et supervision environnementale.



36. Final expectation

Generate the complete first version of PlastiFind OS with:

authentication

responsive sidebar

polished dashboard

functional CRUD operations

Supabase database

realistic PlastiFind data

linked modules

French default language

modern dark interface

light-mode support

file upload areas

charts and progress indicators

startup, engineering and funding workflows

Prioritize the following modules in the first generated version:

Dashboard

Products / Labi-Bot

Projects

Tasks

Roadmap

Funding

CRM

Engineering

Documents

Meetings

Finance

Company

After these work correctly, create the remaining modules.

Do not reduce the project to a landing page. Build an actual internal startup-management web application.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c5dd0c26-e84e-4c09-a483-e7e196009e01).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
